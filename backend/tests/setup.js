// Thiết lập các biến môi trường cho quá trình chạy kiểm thử Jest
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_strictly_for_jest_supertest_testing_purposes';
process.env.JWT_EXPIRES_IN = '24h';
