import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
}

describe('Frontend Auth Components & Validation', () => {
  test('LoginPage: Hiển thị đầy đủ form đăng nhập và nhãn input', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Địa chỉ Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập ngay/i })).toBeInTheDocument();
  });

  test('RegisterPage: Hiển thị form đăng ký và báo lỗi khi mật khẩu xác nhận không khớp', async () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /Tạo tài khoản mới/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Họ và tên sinh viên/i);
    const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
    const passwordInput = screen.getByLabelText(/^Mật khẩu/i);
    const confirmInput = screen.getByLabelText(/Xác nhận mật khẩu/i);
    const submitBtn = screen.getByRole('button', { name: /Đăng ký tài khoản/i });

    fireEvent.change(nameInput, { target: { value: 'Nguyễn Văn Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@uni.edu.vn' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'PasswordKhongKhop' } });

    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
  });
});
