import historyModel from "../models/history.model.js";
import { performance } from "node:perf_hooks";

const VALID_HISTORY_TYPES = ["ask", "summarize", "quiz"];
const MAX_INPUT_LENGTH = 50000;
const MAX_OUTPUT_LENGTH = 100000;

export const historyController = {
  /**
   * Lấy danh sách lịch sử của người dùng đang đăng nhập
   * GET /api/history
   */
  async getAll(req, res) {
    try {
      // Tuyệt đối không lấy user_id từ query hay body, chỉ lấy từ token đã xác thực
      const userId = req.user.id;
      const { type, limit } = req.query;

      const historyList = historyModel.findByUserId(userId, {
        type: typeof type === "string" ? type.trim().toLowerCase() : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: historyList,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi lấy danh sách lịch sử: " + error.message,
      });
    }
  },

  /**
   * Tạo một bản ghi lịch sử học tập mới
   * POST /api/history
   */
  async create(req, res) {
    const startedAt = performance.now();
    let historyType = "unknown";
    try {
      const userId = req.user.id;
      const { type, input, output } = req.body;

      // 1. Kiểm tra trường type
      if (!type || typeof type !== "string") {
        return res.status(400).json({
          success: false,
          message:
            "Vui lòng cung cấp loại lịch sử (type: ask | summarize | quiz).",
        });
      }

      const normalizedType = type.trim().toLowerCase();
      historyType = VALID_HISTORY_TYPES.includes(normalizedType)
        ? normalizedType
        : "invalid";
      if (!VALID_HISTORY_TYPES.includes(normalizedType)) {
        return res.status(400).json({
          success: false,
          message: `Loại lịch sử "${type}" không hợp lệ. Chỉ chấp nhận: ${VALID_HISTORY_TYPES.join(", ")}.`,
        });
      }

      // 2. Kiểm tra input
      if (!input || typeof input !== "string" || input.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Nội dung đầu vào (input) không được để trống.",
        });
      }

      if (input.length > MAX_INPUT_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Nội dung đầu vào vượt quá độ dài tối đa (${MAX_INPUT_LENGTH} ký tự).`,
        });
      }

      // 3. Kiểm tra output
      if (!output || typeof output !== "string" || output.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Nội dung kết quả (output) không được để trống.",
        });
      }

      if (output.length > MAX_OUTPUT_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Nội dung kết quả vượt quá độ dài tối đa (${MAX_OUTPUT_LENGTH} ký tự).`,
        });
      }

      // 4. Lưu vào SQLite
      const newRecord = historyModel.create({
        userId,
        type: normalizedType,
        input: input.trim(),
        output: output.trim(),
      });

      return res.status(201).json({
        success: true,
        data: newRecord,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi lưu bản ghi lịch sử: " + error.message,
      });
    } finally {
      console.info(
        `[timing] history.${historyType}.backend_ms=${Math.round(performance.now() - startedAt)}`,
      );
    }
  },

  /**
   * Xóa một bản ghi lịch sử theo ID
   * DELETE /api/history/:id
   */
  async deleteById(req, res) {
    try {
      const userId = req.user.id;
      const historyId = parseInt(req.params.id, 10);

      // Kiểm tra tính hợp lệ của tham số ID
      if (isNaN(historyId) || historyId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ID bản ghi lịch sử không hợp lệ.",
        });
      }

      // Xóa bản ghi với điều kiện nghiêm ngặt: id = historyId AND user_id = userId
      const wasDeleted = historyModel.deleteByIdAndUserId(historyId, userId);

      if (!wasDeleted) {
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy bản ghi lịch sử hoặc bạn không có quyền xóa.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Đã xóa bản ghi lịch sử thành công.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi xóa bản ghi lịch sử: " + error.message,
      });
    }
  },
};

export default historyController;
