# CR-WEB-003 — ESLint chưa enforce formatting và unused imports ở mức lỗi

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Coding Rule

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Mức ưu tiên theo yêu cầu: **MEDIUM** cho coding-rule. Chưa sửa source code.

- **Ưu tiên:** MEDIUM
- **File:** `eslint.config.js`
- **Phát hiện:** `@typescript-eslint/no-unused-vars` đang ở mức warning; chưa thấy formatter check trong cấu hình ESLint.
- **Ảnh hưởng:** Coding-rule violations có thể không chặn CI nếu pipeline chỉ chạy lint và không chạy typecheck.
- **Hướng xử lý:** Chuyển các vi phạm chắc chắn thành error; bổ sung format check và bảo đảm CI chạy typecheck riêng.
