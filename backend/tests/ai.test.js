import request from "supertest";
import app from "../src/app.js";
import db from "../src/config/db.js";
import {
  setGeminiClient,
  getGeminiClient,
} from "../src/services/gemini.service.js";

describe("BƯỚC 2.5: Kiểm thử toàn diện Gemini AI API (Jest + Supertest)", () => {
  let authToken;
  const generatedRequests = [];

  // Tạo mock client giả lập Gemini AI trả kết quả định dạng chuẩn
  const mockGeminiClient = {
    models: {
      async generateContent({ contents, model, config }) {
        const textPrompt =
          typeof contents === "string" ? contents : JSON.stringify(contents);
        generatedRequests.push({ model, config });

        // Giả lập câu trả lời trắc nghiệm
        if (textPrompt.includes("câu hỏi trắc nghiệm")) {
          return {
            text: JSON.stringify(
              Array.from(
                {
                  length: Number(textPrompt.match(/Tạo đúng (\d+)/)?.[1] || 1),
                },
                (_, index) => ({
                  id: index + 1,
                  question:
                    "Mã trạng thái HTTP nào biểu thị tài nguyên được tạo thành công?",
                  options: [
                    "200 OK",
                    "201 Created",
                    "204 No Content",
                    "301 Moved",
                  ],
                  answerIndex: 1,
                  explanation:
                    "Mã 201 Created được dùng khi tài nguyên mới được tạo thành công.",
                }),
              ),
            ),
          };
        }

        // Giả lập câu trả lời tóm tắt
        if (textPrompt.includes("trợ lý tóm tắt")) {
          return {
            text: "1. Điểm chính thứ nhất.\n2. Điểm chính thứ hai.\n3. Điểm chính thứ ba.",
          };
        }

        // Giả lập câu trả lời hỏi đáp
        return {
          text: "Thuật toán Binary Search (Tìm kiếm nhị phân) hoạt động bằng cách chia đôi không gian tìm kiếm.",
        };
      },
    },
  };

  beforeAll(() => {
    // Thiết lập mock client để bài test chạy độc lập, tốc độ mili-giây, không tiêu tốn quota Gemini thật
    setGeminiClient(mockGeminiClient);
  });

  afterAll(() => {
    // Reset mock client
    setGeminiClient(null);
  });

  beforeEach(async () => {
    generatedRequests.length = 0;
    db.prepare("DELETE FROM users").run();

    // Đăng ký tài khoản mẫu để lấy token cho các test AI
    const res = await request(app).post("/api/auth/register").send({
      name: "Sinh viên Test AI",
      email: "ai.student@university.edu.vn",
      password: "Password123!",
    });
    authToken = res.body.data.token;
  });

  // ----------------------------------------------------------------------------
  // 1. KIỂM THỬ XÁC THỰC BẢO MẬT (CHẶN KHI KHÔNG CÓ TOKEN)
  // ----------------------------------------------------------------------------
  describe("Xác thực bảo mật API AI", () => {
    test("1. Chặn POST /api/ai/ask khi không có Bearer token (HTTP 401)", async () => {
      const res = await request(app)
        .post("/api/ai/ask")
        .send({ question: "Test" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("2. Chặn POST /api/ai/summarize khi không có Bearer token (HTTP 401)", async () => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .send({ content: "Test" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("3. Chặn POST /api/ai/quiz khi không có Bearer token (HTTP 401)", async () => {
      const res = await request(app)
        .post("/api/ai/quiz")
        .send({ topic: "Test" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. KIỂM THỬ ENDPOINT POST /api/ai/ask
  // ----------------------------------------------------------------------------
  describe("POST /api/ai/ask", () => {
    test("4. Từ chối câu hỏi rỗng hoặc thiếu (HTTP 400)", async () => {
      const res = await request(app)
        .post("/api/ai/ask")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ question: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cung cấp nội dung câu hỏi/i);
    });

    test("5. Hỏi đáp thành công trả về 200 và cấu trúc envelope chuẩn", async () => {
      const res = await request(app)
        .post("/api/ai/ask")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          question: "Giải thích giúp tôi giải thuật Binary Search?",
          context: "Môn Cấu trúc dữ liệu và giải thuật",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("answer");
      expect(res.body.data.answer).toMatch(/Binary Search/i);
      expect(res.body.data.type).toBe("ask");
      expect(generatedRequests.at(-1)).toMatchObject({
        model: "gemini-3.5-flash-lite",
        config: {
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      });
    });
  });

  // ----------------------------------------------------------------------------
  // 3. KIỂM THỬ ENDPOINT POST /api/ai/summarize
  // ----------------------------------------------------------------------------
  describe("POST /api/ai/summarize", () => {
    test("6. Từ chối nội dung tóm tắt rỗng (HTTP 400)", async () => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cung cấp nội dung văn bản/i);
    });

    test("7. Từ chối tham số độ dài (length) không hợp lệ (HTTP 400)", async () => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Văn bản hợp lệ dài 100 từ...",
          length: "super_long_invalid",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(
        /không hợp lệ.*short.*medium.*detailed/i,
      );
    });

    test("8. Tóm tắt thành công trả về 200 và định dạng tóm tắt", async () => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Đoạn văn bản bài học Lập trình Web nâng cao...",
          length: "short",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("summary");
      expect(res.body.data.type).toBe("summarize");
    });

    test.each([
      ["short", 512],
      ["medium", 1536],
      ["detailed", 4096],
    ])("Giữ đúng cấu hình mức %s", async (length, maxOutputTokens) => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Nội dung bài học cần tóm tắt.", length });

      expect(res.status).toBe(200);
      expect(generatedRequests.at(-1)).toMatchObject({
        model: "gemini-3.5-flash-lite",
        config: {
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      });
    });
  });

  // ----------------------------------------------------------------------------
  // 4. KIỂM THỬ ENDPOINT POST /api/ai/quiz
  // ----------------------------------------------------------------------------
  describe("POST /api/ai/quiz", () => {
    test("9. Từ chối chủ đề (topic) bị thiếu hoặc rỗng (HTTP 400)", async () => {
      const res = await request(app)
        .post("/api/ai/quiz")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ topic: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cung cấp chủ đề/i);
    });

    test("10. Từ chối numQuestions nằm ngoài khoảng 1 đến 10 (HTTP 400)", async () => {
      const resTooBig = await request(app)
        .post("/api/ai/quiz")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ topic: "HTTP protocol", numQuestions: 20 });

      expect(resTooBig.status).toBe(400);
      expect(resTooBig.body.message).toMatch(/số nguyên từ 1 đến 10/i);

      const resZero = await request(app)
        .post("/api/ai/quiz")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ topic: "HTTP protocol", numQuestions: 0 });

      expect(resZero.status).toBe(400);
      expect(resZero.body.message).toMatch(/số nguyên từ 1 đến 10/i);
    });

    test("11. Sinh bộ câu hỏi trắc nghiệm thành công trả về danh sách câu hỏi (HTTP 200)", async () => {
      const res = await request(app)
        .post("/api/ai/quiz")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          topic: "Lập trình mạng và giao thức HTTP/HTTPS",
          numQuestions: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty(
        "topic",
        "Lập trình mạng và giao thức HTTP/HTTPS",
      );
      expect(res.body.data.type).toBe("quiz");
      expect(Array.isArray(res.body.data.questions)).toBe(true);
      expect(res.body.data.questions).toHaveLength(3);

      const q = res.body.data.questions[0];
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("answerIndex");
      expect(q).toHaveProperty("explanation");
      expect(
        res.body.data.questions.every((item) => item.options.length === 4),
      ).toBe(true);
      expect(generatedRequests.at(-1)).toMatchObject({
        model: "gemini-3.5-flash-lite",
        config: {
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: {
            minItems: 3,
            maxItems: 3,
            items: { properties: { options: { minItems: 4, maxItems: 4 } } },
          },
        },
      });
    });

    test("Từ chối quiz không đủ bốn lựa chọn thay vì trả dữ liệu sai cấu trúc", async () => {
      setGeminiClient({
        models: {
          async generateContent() {
            return {
              text: JSON.stringify([
                {
                  id: 1,
                  question: "Câu hỏi kiểm thử?",
                  options: ["A", "B", "C"],
                  answerIndex: 1,
                  explanation: "Giải thích kiểm thử.",
                },
              ]),
            };
          },
        },
      });

      try {
        const res = await request(app)
          .post("/api/ai/quiz")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ topic: "HTTP", numQuestions: 1 });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/đúng 4 lựa chọn/i);
      } finally {
        setGeminiClient(mockGeminiClient);
      }
    });
  });

  // ----------------------------------------------------------------------------
  // 5. KIỂM THỬ XỬ LÝ LỖI MÁY CHỦ VÀ CẤU HÌNH GEMINI_API_KEY
  // ----------------------------------------------------------------------------
  describe("Xử lý lỗi hệ thống", () => {
    test("12. Báo lỗi 500 khi Gemini API ném lỗi ngoại lệ", async () => {
      const errorClient = {
        models: {
          async generateContent() {
            throw new Error("Google Gemini API quota exceeded");
          },
        },
      };
      setGeminiClient(errorClient);

      const res = await request(app)
        .post("/api/ai/ask")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ question: "Câu hỏi test lỗi?" });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/quota exceeded/i);

      // Phục hồi lại mock chuẩn
      setGeminiClient(mockGeminiClient);
    });

    test("13. Báo lỗi cấu hình rõ ràng khi GEMINI_API_KEY bị thiếu hoặc dùng giá trị placeholder", () => {
      setGeminiClient(null); // Cho phép kiểm tra hàm getGeminiClient thật
      const originalKey = process.env.GEMINI_API_KEY;

      try {
        delete process.env.GEMINI_API_KEY;
        expect(() => getGeminiClient()).toThrow(/chưa được thiết lập/i);

        process.env.GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
        expect(() => getGeminiClient()).toThrow(/đang dùng giá trị mẫu/i);
      } finally {
        process.env.GEMINI_API_KEY = originalKey;
        setGeminiClient(mockGeminiClient);
      }
    });
  });
});
