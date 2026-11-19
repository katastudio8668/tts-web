# AP-WEB-006 — Retry tạo generation dùng Idempotency-Key mới

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/GeneratePage.tsx`.
- **Phát hiện:** `crypto.randomUUID()` được tạo bên trong `mutationFn` cho mỗi lần gửi yêu cầu tạo generation.
- **Rủi ro:** Nếu server đã tạo job và reserve credit nhưng response bị timeout/mất, người dùng bấm thử lại sẽ gửi key mới. Backend coi đó là yêu cầu mới, có thể tạo thêm job và reserve/trừ credit thêm lần nữa.
- **Hướng xử lý:** Giữ idempotency key theo một generation intent và tái sử dụng khi retry cùng payload; chỉ tạo key mới khi người dùng chủ động tạo yêu cầu mới. Kết hợp fingerprint request ở BE.
