import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User } from '../types/user';

export const useAuth = () => {
  // State quản lý thông tin người dùng và trạng thái đăng nhập
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State quản lý việc hiển thị các modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // State để biết đã kiểm tra token ban đầu hay chưa
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // useEffect này sẽ chạy một lần duy nhất khi ứng dụng khởi động
  // để kiểm tra xem người dùng đã đăng nhập từ phiên trước chưa
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Nếu có lỗi, dọn dẹp localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    // Dù có token hay không, việc kiểm tra đã hoàn tất
    setIsAuthLoading(false); 
  }, []);

  // Hàm xử lý khi đăng nhập/đăng ký thành công
  const handleAuthSuccess = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success("Đăng xuất thành công!");
  };

  // Trả về tất cả các state và hàm cần thiết cho component khác sử dụng
  return {
    currentUser,
    isAuthenticated,
    isAuthLoading,
    showLoginModal,
    setShowLoginModal,
    showRegisterModal,
    setShowRegisterModal,
    handleAuthSuccess,
    handleLogout,
  };
};
