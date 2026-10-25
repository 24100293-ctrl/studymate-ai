import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import historyRoutes from './routes/history.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Gắn các routes nghiệp vụ
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ai', aiRoutes);

// Endpoint kiểm tra sức khỏe hệ thống và kết nối database (Health Check)
app.get('/api/health', (req, res) => {
  try {
    const result = db.prepare('SELECT 1 as is_alive').get();
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'StudyMate AI Backend API',
        database: result?.is_alive === 1 ? 'connected' : 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi kết nối cơ sở dữ liệu: ' + error.message,
    });
  }
});

// Middleware xử lý 404 cho các route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn ${req.originalUrl} không tồn tại trên hệ thống.`,
  });
});

// Middleware xử lý lỗi tập trung (Error Handler)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ nội bộ: ' + (err.message || 'Không xác định'),
  });
});

export default app;
