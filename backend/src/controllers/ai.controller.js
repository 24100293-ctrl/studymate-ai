import geminiService from "../services/gemini.service.js";
import { performance } from "node:perf_hooks";

const VALID_SUMMARIZE_LENGTHS = ["short", "medium", "detailed"];

function logRequestDuration(feature, startedAt) {
  console.info(
    `[timing] ${feature}.backend_ms=${Math.round(performance.now() - startedAt)}`,
  );
}

export const aiController = {
  /**
   * Hỏi đáp kiến thức học tập với Gemini AI
   * POST /api/ai/ask
   */
  async ask(req, res) {
    const startedAt = performance.now();
    try {
      const { question, context } = req.body;

      if (!question || typeof question !== "string" || question.trim() === "") {
        return res.status(400).json({
          success: false,
          message:
            "Vui lòng cung cấp nội dung câu hỏi cần giải đáp (question).",
        });
      }

      const answer = await geminiService.askQuestion(
        question.trim(),
        typeof context === "string" ? context.trim() : "",
      );

      return res.status(200).json({
        success: true,
        data: {
          answer,
          type: "ask",
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý câu hỏi qua Gemini AI: " + error.message,
      });
    } finally {
      logRequestDuration("ask", startedAt);
    }
  },

  /**
   * Tóm tắt bài học với Gemini AI
   * POST /api/ai/summarize
   */
  async summarize(req, res) {
    const startedAt = performance.now();
    try {
      const { content, length = "medium" } = req.body;

      if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp nội dung văn bản cần tóm tắt (content).",
        });
      }

      const normalizedLength =
        typeof length === "string" ? length.trim().toLowerCase() : "medium";
      if (!VALID_SUMMARIZE_LENGTHS.includes(normalizedLength)) {
        return res.status(400).json({
          success: false,
          message: `Độ dài tóm tắt "${length}" không hợp lệ. Chỉ chấp nhận: ${VALID_SUMMARIZE_LENGTHS.join(", ")}.`,
        });
      }

      const summary = await geminiService.summarizeContent(
        content.trim(),
        normalizedLength,
      );

      return res.status(200).json({
        success: true,
        data: {
          summary,
          type: "summarize",
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tóm tắt bài học qua Gemini AI: " + error.message,
      });
    } finally {
      logRequestDuration("summarize", startedAt);
    }
  },

  /**
   * Sinh bộ câu hỏi trắc nghiệm ôn tập theo chủ đề
   * POST /api/ai/quiz
   */
  async quiz(req, res) {
    const startedAt = performance.now();
    try {
      // Hỗ trợ cả hai quy ước (topic hoặc content, numQuestions hoặc numberOfQuestions)
      const { topic, content, numQuestions, numberOfQuestions } = req.body;
      const targetTopic = topic || content;
      const targetNum = numQuestions ?? numberOfQuestions ?? 3;

      if (
        !targetTopic ||
        typeof targetTopic !== "string" ||
        targetTopic.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vui lòng cung cấp chủ đề hoặc nội dung cần tạo câu hỏi trắc nghiệm (topic/content).",
        });
      }

      let parsedNum = parseInt(targetNum, 10);
      if (isNaN(parsedNum) || parsedNum < 1 || parsedNum > 10) {
        return res.status(400).json({
          success: false,
          message:
            "Số lượng câu hỏi (numQuestions/numberOfQuestions) phải là số nguyên từ 1 đến 10.",
        });
      }

      const questions = await geminiService.generateQuiz(
        targetTopic.trim(),
        parsedNum,
      );

      return res.status(200).json({
        success: true,
        data: {
          topic: targetTopic.trim(),
          questions,
          type: "quiz",
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Lỗi khi tạo bộ câu hỏi trắc nghiệm qua Gemini AI: " + error.message,
      });
    } finally {
      logRequestDuration("quiz", startedAt);
    }
  },
};

export default aiController;
