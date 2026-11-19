# AP-WEB-006 — Retry tạo generation dùng Idempotency-Key mới

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — cần xác minh bằng CI và kiểm thử browser/API  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/GeneratePage.tsx`.
- **Phát hiện trước khi sửa:** `crypto.randomUUID()` được tạo bên trong `mutationFn` cho mỗi lần gửi yêu cầu tạo generation.
- **Rủi ro:** Nếu server đã tạo job nhưng response bị timeout/mất, người dùng bấm thử lại sẽ gửi key mới. Backend coi đó là yêu cầu mới, có thể tạo thêm job và tính credit lần nữa khi cả hai voice thành công.
- **Cách sửa:** Tạo idempotency key gắn với payload của một generation intent. Nếu người dùng retry đúng payload thì tái sử dụng key; nếu nội dung, voice hoặc tham số thay đổi thì tạo key mới. Giữ key trong suốt thời gian job QUEUED/RUNNING; chỉ xóa intent khi job vào trạng thái SUCCEEDED/FAILED/CANCELLED để retry hoặc bấm lại cùng payload không tạo job trùng.
- **Thời điểm sửa:** 2026-11-19 18:49:38 (UTC+07:00).
- **Xác minh:** Đã cập nhật source trên branch `chore/fixed-bugs-registry`. Chưa chạy build, unit test hoặc browser/e2e test; chưa đánh dấu VERIFIED.
