"use client";

import { useEffect, useState } from "react";
import { Camera, Mail, Phone, MapPin, User, Shield, Edit2, Save, X, Loader2, Sparkles } from "lucide-react";

// Mock auth hook - replace with your actual auth
const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Simulate getting user from localStorage
    const authData = { user: { id: 1, email: "painpen1987@gmail.com" } };
    setUser(authData.user);
  }, []);
  
  return {
    user,
    updateUser: (data) => console.log("Update user:", data)
  };
};

// API Client
const apiClient = {
  getNguoiDung: async (params) => {
    const id = params.id.replace('eq.', '');
    const response = await fetch(`https://j2ee.oshi.id.vn:443/api/v1/nguoi_dung?id=eq.${id}`);
    return response.json();
  },
  updateNguoiDung: async (id, data) => {
    const response = await fetch(`https://j2ee.oshi.id.vn:443/api/v1/nguoi_dung?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export default function ProfilePage() {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    ho: "",
    ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.getNguoiDung({ id: `eq.${authUser.id}` });
        
        if (response && response.length > 0) {
          const userData = response[0];
          setUser(userData);
          setForm({
            ho: userData.ho || "",
            ten: userData.ten || "",
            email: userData.email || "",
            so_dien_thoai: userData.so_dien_thoai || "",
            dia_chi: userData.dia_chi || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      await apiClient.updateNguoiDung(user.id, {
        ho: form.ho,
        ten: form.ten,
        so_dien_thoai: form.so_dien_thoai,
        dia_chi: form.dia_chi,
      });

      const updatedUser = { ...user, ...form };
      setUser(updatedUser);
      updateAuthUser(form);
      
      setIsEditing(false);
      setAvatarPreview(null);
      
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        ho: user.ho || "",
        ten: user.ten || "",
        email: user.email || "",
        so_dien_thoai: user.so_dien_thoai || "",
        dia_chi: user.dia_chi || "",
      });
    }
    setIsEditing(false);
    setAvatarPreview(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-lime-500 mx-auto mb-4" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-pulse" />
          </div>
          <p className="text-gray-700 font-medium text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl">
          <p className="text-gray-600 text-lg">Vui lòng đăng nhập để xem hồ sơ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-yellow-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-2 border-lime-200">
          {/* Gradient Header with Pattern */}
          <div className="h-40 bg-gradient-to-r from-lime-400 via-yellow-400 to-green-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <Sparkles className="absolute top-4 right-4 w-8 h-8 text-white animate-pulse" />
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 mb-6">
              {/* Avatar with Glow Effect */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-green-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-lime-400 via-yellow-400 to-green-400">
                  {avatarPreview || user.avatar ? (
                    <img 
                      src={avatarPreview || user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {user.ho?.charAt(0) || ""}{user.ten?.charAt(0) || ""}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <Camera className="text-white mx-auto mb-1" size={28} />
                      <span className="text-white text-xs font-medium">Đổi ảnh</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="md:ml-8 mt-6 md:mt-0 text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-lime-600 via-yellow-600 to-green-600 bg-clip-text text-transparent mb-3">
                  {user.ho} {user.ten}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-500 via-yellow-500 to-green-500 text-white rounded-2xl font-bold hover:from-lime-600 hover:via-yellow-600 hover:to-green-600 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
                  >
                    <Edit2 size={20} />
                    Chỉnh sửa
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 animate-pulse" />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-2xl font-bold hover:from-green-600 hover:to-lime-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Lưu
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-4 bg-gray-500 text-white rounded-2xl font-bold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={20} />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Personal Info Card */}
          <div className="relative group bg-white rounded-3xl shadow-xl p-8 border-2 border-lime-200 hover:border-lime-300 transition-all hover:shadow-2xl">
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-lime-200 to-yellow-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-xl">
                <User className="text-white" size={24} />
              </div>
              Thông tin cá nhân
            </h2>
            
            <div className="space-y-5">
              <div className="transform hover:scale-102 transition-transform">
                <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Họ</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ho"
                    value={form.ho}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-lime-200 rounded-2xl focus:ring-4 focus:ring-lime-200 focus:border-lime-400 transition-all text-gray-800 font-medium"
                    placeholder="Nhập họ của bạn"
                  />
                ) : (
                  <p className="px-5 py-4 bg-gradient-to-r from-lime-50 to-yellow-50 rounded-2xl text-gray-800 font-medium border border-lime-200">{user.ho || "Chưa cập nhật"}</p>
                )}
              </div>

              <div className="transform hover:scale-102 transition-transform">
                <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ten"
                    value={form.ten}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-lime-200 rounded-2xl focus:ring-4 focus:ring-lime-200 focus:border-lime-400 transition-all text-gray-800 font-medium"
                    placeholder="Nhập tên của bạn"
                  />
                ) : (
                  <p className="px-5 py-4 bg-gradient-to-r from-lime-50 to-yellow-50 rounded-2xl text-gray-800 font-medium border border-lime-200">{user.ten || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="relative group bg-white rounded-3xl shadow-xl p-8 border-2 border-yellow-200 hover:border-yellow-300 transition-all hover:shadow-2xl">
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-200 to-green-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-green-400 rounded-xl">
                <Mail className="text-white" size={24} />
              </div>
              Thông tin liên hệ
            </h2>
            
            <div className="space-y-5">
              <div className="transform hover:scale-102 transition-transform">
                <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-2">
                  <Mail size={16} className="text-yellow-500" />
                  Email
                </label>
                <p className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl text-gray-800 font-medium border border-yellow-200">{user.email}</p>
                <p className="text-xs text-gray-500 mt-2 ml-2 flex items-center gap-1">
                  <Shield size={12} />
                  Email không thể thay đổi
                </p>
              </div>

              <div className="transform hover:scale-102 transition-transform">
                <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-2">
                  <Phone size={16} className="text-green-500" />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="so_dien_thoai"
                    value={form.so_dien_thoai}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-yellow-200 rounded-2xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 transition-all text-gray-800 font-medium"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl text-gray-800 font-medium border border-yellow-200">{user.so_dien_thoai || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Card - Full Width */}
        <div className="relative group bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-2xl mb-6">
          <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-lime-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-lime-400 rounded-xl">
              <MapPin className="text-white" size={24} />
            </div>
            Địa chỉ
          </h2>
          
          <div className="transform hover:scale-102 transition-transform">
            <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Địa chỉ chi tiết</label>
            {isEditing ? (
              <textarea
                name="dia_chi"
                value={form.dia_chi}
                onChange={handleChange}
                rows={3}
                className="w-full px-5 py-4 border-2 border-green-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all resize-none text-gray-800 font-medium"
                placeholder="Nhập địa chỉ của bạn"
              />
            ) : (
              <p className="px-5 py-4 bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl text-gray-800 font-medium border border-green-200 min-h-[80px]">{user.dia_chi || "Chưa cập nhật"}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="relative overflow-hidden bg-gradient-to-r from-lime-100 via-yellow-100 to-green-100 rounded-3xl p-8 border-2 border-lime-300 shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300 rounded-full filter blur-3xl opacity-30"></div>
          <div className="relative flex items-start gap-5">
            <div className="p-3 bg-gradient-to-br from-lime-500 to-yellow-500 rounded-2xl shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                Bảo mật thông tin
                <Sparkles className="text-yellow-500" size={18} />
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Thông tin cá nhân của bạn được bảo mật và chỉ sử dụng cho mục đích quản lý tài khoản. 
                Nếu bạn muốn thay đổi mật khẩu hoặc cần hỗ trợ, vui lòng liên hệ với quản trị viên.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-lime-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Tài khoản đã xác thực</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-lime-200">
                  <Shield size={14} className="text-lime-600" />
                  <span className="text-sm font-medium text-gray-700">Dữ liệu được mã hóa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}