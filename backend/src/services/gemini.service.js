import { GoogleGenAI } from "@google/genai";
import { performance } from "node:perf_hooks";

const GEMINI_MODEL = "gemini-3.5-flash-lite";

let customClient = null;

/**
 * Lấy instance Google GenAI client
 * @returns {GoogleGenAI}
 */
export function getGeminiClient() {
  if (customClient) {
    return customClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (
    !apiKey ||
    apiKey.trim() === "" ||
    apiKey === "YOUR_GEMINI_API_KEY_HERE"
  ) {
    throw new Error(
      "Lỗi cấu hình: GEMINI_API_KEY chưa được thiết lập trong biến môi trường hoặc đang dùng giá trị mẫu. Vui lòng cấu hình GEMINI_API_KEY trong file backend/.env.",
    );
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Cho phép thiết lập client giả lập (dùng cho unit/integration testing không tốn quota API)
 * @param {object|null} mockClient
 */
export function setGeminiClient(mockClient) {
  customClient = mockClient;
}

async function generateContent(feature, contents, config) {
  const startedAt = performance.now();
  try {
    const ai = getGeminiClient();
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config,
    });
  } finally {
    console.info(
      `[timing] ${feature}.gemini_ms=${Math.round(performance.now() - startedAt)}`,
    );
  }
}

function validateQuiz(questions, numQuestions) {
  if (!Array.isArray(questions) || questions.length !== numQuestions) {
    throw new Error(`Gemini phải trả về đúng ${numQuestions} câu hỏi.`);
  }

  const isValidQuestion = (question, index) =>
    question &&
    typeof question === "object" &&
    Number.isInteger(question.id) &&
    question.id === index + 1 &&
    typeof question.question === "string" &&
    question.question.trim() !== "" &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every(
      (option) => typeof option === "string" && option.trim() !== "",
    ) &&
    Number.isInteger(question.answerIndex) &&
    question.answerIndex >= 0 &&
    question.answerIndex < 4 &&
    typeof question.explanation === "string" &&
    question.explanation.trim() !== "";

  if (!questions.every(isValidQuestion)) {
    throw new Error(
      "Mỗi câu hỏi phải có nội dung, đúng 4 lựa chọn, đáp án hợp lệ và giải thích.",
    );
  }
}

export const geminiService = {
  /**
   * Hỏi đáp kiến thức học tập với Gemini
   * @param {string} question
   * @param {string} [context]
   * @returns {Promise<string>}
   */
  async askQuestion(question, context = "") {
    let prompt = "";
    if (context && context.trim() !== "") {
      prompt += `Ngữ cảnh môn học hoặc bài học: ${context.trim()}\n`;
    }
    prompt += `Câu hỏi: ${question.trim()}`;

    const response = await generateContent("ask", prompt, {
      systemInstruction:
        "Bạn là StudyMate AI, trợ lý học tập. Trả lời đúng trọng tâm, chính xác, rõ ràng và ngắn gọn. Dùng ví dụ chỉ khi cần để giải thích.",
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: "minimal" },
    });

    if (!response.text || response.text.trim() === "") {
      throw new Error("Gemini không trả về nội dung câu trả lời.");
    }

    return response.text.trim();
  },

  /**
   * Tóm tắt bài học với các mức độ dài khác nhau
   * @param {string} content
   * @param {'short'|'medium'|'detailed'} [length='medium']
   * @returns {Promise<string>}
   */
  async summarizeContent(content, length = "medium") {
    let lengthInstruction =
      "Tóm tắt cân bằng trong 5-8 gạch đầu dòng, nêu các ý chính và giải thích ngắn.";
    if (length === "short") {
      lengthInstruction =
        "Tóm tắt trong 3-5 gạch đầu dòng cốt lõi, không thêm lời dẫn.";
    } else if (length === "detailed") {
      lengthInstruction =
        "Tóm tắt chi tiết theo các đề mục, giữ đủ luận điểm và giải thích ngắn; không lặp ý hoặc thêm thông tin ngoài nguồn.";
    }

    const prompt =
      `Yêu cầu: ${lengthInstruction}\n\n` +
      `Nội dung văn bản cần tóm tắt:\n"""\n${content.trim()}\n"""`;

    const maxOutputTokens =
      {
        short: 512,
        medium: 1536,
        detailed: 4096,
      }[length] ?? 1536;

    const response = await generateContent("summarize", prompt, {
      systemInstruction:
        "Bạn là StudyMate AI, trợ lý tóm tắt tài liệu học tập. Chỉ tóm tắt thông tin có trong nguồn.",
      maxOutputTokens,
      thinkingConfig: { thinkingLevel: "minimal" },
    });

    if (!response.text || response.text.trim() === "") {
      throw new Error("Gemini không trả về nội dung tóm tắt.");
    }

    return response.text.trim();
  },

  /**
   * Sinh bộ câu hỏi trắc nghiệm ôn tập theo chủ đề
   * @param {string} topic
   * @param {number} [numQuestions=3]
   * @returns {Promise<Array<object>>}
   */
  async generateQuiz(topic, numQuestions = 3) {
    const prompt =
      `Tạo đúng ${numQuestions} câu hỏi trắc nghiệm ngắn về chủ đề: "${topic.trim()}". ` +
      "Mỗi câu có đúng 4 lựa chọn, một đáp án đúng, answerIndex là chỉ số 0-3 của đáp án đó, " +
      "và giải thích ngắn. Đánh số id liên tiếp từ 1.";

    const responseJsonSchema = {
      type: "array",
      minItems: numQuestions,
      maxItems: numQuestions,
      items: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1, maximum: numQuestions },
          question: { type: "string" },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
          },
          answerIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" },
        },
        required: ["id", "question", "options", "answerIndex", "explanation"],
        additionalProperties: false,
      },
    };

    const response = await generateContent("quiz", prompt, {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseJsonSchema,
      thinkingConfig: { thinkingLevel: "minimal" },
    });

    let rawText = response.text ? response.text.trim() : "";

    // Làm sạch chuỗi nếu AI vô tình bọc trong markdown code fence ```json ... ```
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      if (!rawText) {
        throw new Error("Gemini không trả về dữ liệu quiz.");
      }

      const parsed = JSON.parse(rawText);
      validateQuiz(parsed, numQuestions);
      return parsed;
    } catch (parseError) {
      throw new Error(
        "Lỗi xử lý định dạng trắc nghiệm từ Gemini: " + parseError.message,
      );
    }
  },
};

export default geminiService;
