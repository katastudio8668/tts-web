# AP-WEB-003 — API URL fallback về localhost có thể che giấu cấu hình production bị thiếu

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

- **Ưu tiên:** HIGH
- **File:** `src/lib/api.ts`
- **Phát hiện:** Khi `VITE_API_BASE_URL` rỗng, code tự dùng `http://localhost:3058/api/v1`.
- **Rủi ro:** Bản production có thể build/deploy thành công nhưng browser của người dùng lại gọi localhost trên máy họ.
- **Hướng xử lý khi được duyệt:** Fail-fast khi thiếu API URL ở production; chỉ dùng localhost trong môi trường development có chủ đích.
