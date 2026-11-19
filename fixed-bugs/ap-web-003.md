# AP-WEB-003 — API URL production không còn fallback về localhost

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy CI/test và production smoke test  
> **Nhóm:** Anti-pattern

## Phạm vi và thay đổi

- **Branch:** `main`
- **Regression test commit:** `47095dafe2dd8f76f513825821b785bed02ee6cf`
- **Fix commit:** `2078ef0eeb836d656eb3d59b4ea72807992c64d8`
- **File sửa:** `src/lib/api.ts`
- **File test:** `src/lib/api.test.ts`
- **Thời điểm:** 2026-11-20 (UTC+07:00)

## Nguyên nhân

Trước đây, khi `VITE_API_BASE_URL` không được khai báo hoặc là chuỗi rỗng, API client mặc định gọi `http://localhost:3058/api/v1`. Bản production có thể chạy nhưng request sẽ hướng tới localhost trên thiết bị của người dùng.

## Cách sửa

- Chỉ cho phép fallback localhost khi `import.meta.env.DEV` là `true`.
- Khi chạy ngoài development mà thiếu `VITE_API_BASE_URL`, module ném lỗi cấu hình ngay khi khởi tạo (fail-fast).
- Bổ sung regression test cho trường hợp production thiếu biến môi trường.
- Giữ nguyên hành vi development và bearer-token handling.

## Bằng chứng và giới hạn xác minh

- Source trên `main` đã được cập nhật ở commit fix nêu trên.
- Regression test đã được thêm trước khi sửa source.
- **Chưa chạy được** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` hoặc browser/production smoke test trong phiên này.
- Vì chưa có kết quả chạy test, không đánh dấu `VERIFIED`. Cần CI xác nhận test production-missing-env và build với API URL production hợp lệ.

## Tiêu chí hoàn tất xác minh

1. Test xác nhận thiếu `VITE_API_BASE_URL` ngoài development làm module fail-fast.
2. Test development xác nhận fallback localhost vẫn hoạt động.
3. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` đều pass.
4. Production smoke test xác nhận request đi tới API URL đã cấu hình, không phải localhost.
