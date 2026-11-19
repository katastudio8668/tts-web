# AP-WEB-001 — Tạo Idempotency-Key mới cho mỗi lần người dùng thử lại thanh toán

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

- **Ưu tiên:** HIGH
- **File:** `src/pages/PlansPage.tsx:3`
- **Phát hiện:** `crypto.randomUUID()` được tạo bên trong `mutationFn`; mỗi lần gọi mutation tạo key mới.
- **Rủi ro:** Nếu request trước đã tạo đơn ở server nhưng response bị mất/timeout, lần bấm mua tiếp theo gửi key mới và có thể tạo thêm đơn cho cùng ý định mua.
- **Hướng xử lý khi được duyệt:** Tạo và giữ key theo một purchase intent; tái sử dụng key khi retry cùng request, chỉ tạo key mới khi người dùng chủ động bắt đầu giao dịch mới.
