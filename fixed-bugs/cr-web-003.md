# CR-WEB-003 — ESLint chưa enforce unused variables ở mức lỗi

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — chờ CI  
> **Nhóm:** Coding Rule

> Ngày sửa: 2026-11-20 (UTC+07:00)  
> Branch: `main`  
> Commit source: `986dd4a810f3b2d990dedf1809fbed1cef40c1f3`

- **File:** `eslint.config.js`
- **Thay đổi:** Nâng `@typescript-eslint/no-unused-vars` từ `warn` lên `error`.
- **Ngoại lệ có chủ đích:** Cho phép tên bắt đầu bằng `_` đối với biến, tham số và caught errors không sử dụng; giữ tương thích quy ước tham số callback không dùng.
- **CI:** `.github/workflows/ci.yml` đã chạy riêng `npm run typecheck` sau `npm run lint`; không cần thay đổi pipeline cho phần typecheck.
- **Phạm vi tách biệt:** Kiểm tra định dạng và Prettier thuộc CR-WEB-002, không gộp vào bug này để tránh trùng phạm vi.
- **Xác minh:** Đã kiểm tra source/config và commit trên GitHub. Chưa chạy ESLint/CI tại môi trường thực thi, vì vậy giữ trạng thái FIXED, chưa nâng VERIFIED.
