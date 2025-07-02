# SupportChineseLanguage Frontend

Frontend React cho ứng dụng quản lý từ vựng tiếng Trung - Hán Việt.

## Công nghệ sử dụng
- React (TypeScript)
- Ant Design
- Axios
- React Toastify

## Cài đặt

```bash
cd supportchinelanguage
npm install
```

## Chạy development

```bash
npm start
```
- Ứng dụng chạy ở `http://localhost:3000`
- Mặc định proxy API về backend ở `http://localhost:5000` (cấu hình trong `package.json` nếu cần)

## Build production

```bash
npm run build
```
- Kết quả build nằm trong thư mục `build/`
- Có thể deploy lên Vercel, Netlify, hoặc serve bằng Nginx/Apache

## Cấu trúc thư mục chính
- `src/components/` : Các component UI (bảng, modal, form...)
- `src/api/`        : Gọi API backend
- `src/types/`      : Định nghĩa type TypeScript
- `public/`         : File tĩnh, index.html

## Kết nối backend
- Đảm bảo backend đã chạy (mặc định ở `http://localhost:5000`)
- Nếu deploy lên server, cần sửa các endpoint API cho đúng domain/backend

## Scripts
- `npm start`   : Chạy dev
- `npm run build` : Build production
- `npm test`    : Chạy test

## License
MIT
