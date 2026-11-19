# AP-WEB-007 — Polling trạng thái generation không có giới hạn thời gian

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/GeneratePage.tsx`.
- **Phát hiện:** Query trạng thái generation tiếp tục refetch mỗi 2 giây khi job còn `QUEUED` hoặc `RUNNING`, không có deadline/backoff hoặc giới hạn số lần.
- **Rủi ro:** Job bị kẹt hoặc worker ngừng hoạt động khiến tab tiếp tục gọi API vô hạn, tạo tải không cần thiết lên BE.
- **Hướng xử lý:** Đặt polling deadline/backoff, dừng tự động sau khoảng thời gian hợp lý, hiển thị trạng thái chưa xác định và cho phép người dùng kiểm tra lại thủ công.
