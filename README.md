# Hệ Thống Quyên Góp Từ Thiện

Ứng dụng web quản lý quyên góp từ thiện được xây dựng bằng Next.js 15, React 19, TypeScript và Tailwind CSS.

## Tính năng chính

### Dành cho người dùng
- 🏠 Trang chủ với các dự án nổi bật
- 📋 Danh sách và chi tiết dự án từ thiện
- 💰 Quyên góp trực tuyến cho các dự án
- 📅 Xem và đăng ký tham gia sự kiện
- 📰 Đọc tin tức và bài viết từ thiện
- 🤝 Đăng ký làm tình nguyện viên
- 📞 Liên hệ với tổ chức

### Dành cho quản trị viên
- 📊 Dashboard với thống kê tổng quan
- 🎯 Quản lý dự án (CRUD)
- 💵 Quản lý quyên góp và duyệt giao dịch
- 👥 Quản lý người dùng và phân quyền
- 🙋 Quản lý tình nguyện viên
- 🎉 Quản lý sự kiện
- ✍️ Quản lý tin tức và nội dung
- 📈 Báo cáo và thống kê chi tiết

## Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **API**: PostgREST API
- **Icons**: Lucide React

## Cài đặt

### Yêu cầu hệ thống
- Node.js 18.17 trở lên
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
\`\`\`bash
git clone <repository-url>
cd charity-donation-system
\`\`\`

2. **Cài đặt dependencies**
\`\`\`bash
npm install
# hoặc
yarn install
\`\`\`

3. **Cấu hình biến môi trường**

Tạo file `.env.local` từ file mẫu:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Chỉnh sửa file `.env.local` với thông tin API của bạn:
\`\`\`env
NEXT_PUBLIC_API_URL=http://j2ee.oshi.id.vn/api/v1
\`\`\`

4. **Chạy ứng dụng ở chế độ development**
\`\`\`bash
npm run dev
# hoặc
yarn dev
\`\`\`

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

## Cấu trúc thư mục

\`\`\`
charity-donation-system/
├── app/                          # Next.js App Router
│   ├── admin/                    # Trang quản trị
│   │   ├── du-an/               # Quản lý dự án
│   │   ├── quyen-gop/           # Quản lý quyên góp
│   │   ├── nguoi-dung/          # Quản lý người dùng
│   │   ├── tinh-nguyen-vien/    # Quản lý tình nguyện viên
│   │   ├── su-kien/             # Quản lý sự kiện
│   │   ├── tin-tuc/             # Quản lý tin tức
│   │   ├── bao-cao/             # Báo cáo & thống kê
│   │   ├── layout.tsx           # Layout admin
│   │   └── page.tsx             # Dashboard
│   ├── du-an/                   # Trang dự án công khai
│   ├── su-kien/                 # Trang sự kiện
│   ├── tin-tuc/                 # Trang tin tức
│   ├── tinh-nguyen-vien/        # Đăng ký tình nguyện viên
│   ├── lien-he/                 # Liên hệ
│   ├── dang-nhap/               # Đăng nhập
│   ├── dang-ky/                 # Đăng ký
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Trang chủ
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── header.tsx               # Header công khai
│   ├── footer.tsx               # Footer
│   ├── admin-sidebar.tsx        # Sidebar admin
│   ├── project-card.tsx         # Card dự án
│   ├── event-card.tsx           # Card sự kiện
│   ├── news-card.tsx            # Card tin tức
│   ├── stats-card.tsx           # Card thống kê
│   ├── donation-form.tsx        # Form quyên góp
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utilities & helpers
│   ├── api-config.ts            # Cấu hình API
│   ├── api-client.ts            # API client
│   ├── auth.ts                  # Authentication service
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── middleware.ts                # Next.js middleware
└── public/                      # Static assets
\`\`\`

## Cấu hình API

API host được cấu hình tập trung trong file `lib/api-config.ts`:

\`\`\`typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://j2ee.oshi.id.vn/api/v1',
  ENDPOINTS: {
    DU_AN: '/danh_muc_du_an',
    QUYEN_GOP: '/quyen_gop',
    NGUOI_DUNG: '/nguoi_dung',
    // ... các endpoint khác
  }
}
\`\`\`

Để thay đổi API host, chỉ cần cập nhật biến môi trường `NEXT_PUBLIC_API_URL` trong file `.env.local`.

## Phân quyền người dùng

Hệ thống hỗ trợ 4 loại vai trò:
- **admin**: Toàn quyền quản trị hệ thống
- **editor**: Quản lý nội dung (dự án, tin tức, sự kiện)
- **volunteer**: Tình nguyện viên
- **user**: Người dùng thường (quyên góp, xem thông tin)

Middleware tự động bảo vệ các route `/admin/*` và chỉ cho phép admin và editor truy cập.

## API Endpoints

Tất cả các endpoint API theo chuẩn PostgREST:

- `GET /danh_muc_du_an` - Lấy danh sách dự án
- `GET /danh_muc_du_an?id=eq.{id}` - Lấy chi tiết dự án
- `POST /danh_muc_du_an` - Tạo dự án mới
- `PATCH /danh_muc_du_an?id=eq.{id}` - Cập nhật dự án
- `DELETE /danh_muc_du_an?id=eq.{id}` - Xóa dự án

Tương tự cho các bảng khác: `quyen_gop`, `nguoi_dung`, `tinh_nguyen_vien`, `su_kien`, `tin_tuc`, v.v.

## Build cho production

\`\`\`bash
npm run build
npm start
\`\`\`

## Ghi chú quan trọng

- Tất cả các trường dữ liệu trong database đều sử dụng tiếng Việt không dấu (snake_case)
- API sử dụng PostgREST nên cần tuân thủ cú pháp query của PostgREST
- Middleware bảo vệ các route admin tự động
- Giao diện được thiết kế với màu sắc tươi sáng, thân thiện để tạo cảm giác tin cậy

## Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên repository hoặc liên hệ với đội ngũ phát triển.

## License

MIT License
