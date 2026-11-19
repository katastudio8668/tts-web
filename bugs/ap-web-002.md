# AP-WEB-002 — Polling trạng thái thanh toán không có giới hạn thời gian

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

- **Ưu tiên:** HIGH
- **File:** `src/pages/PaymentResultPage.tsx:2`
- **Phát hiện:** `refetchInterval` tiếp tục gọi API mỗi 5 giây miễn trạng thái là `PENDING`.
- **Rủi ro:** Tab để mở lâu có thể tiếp tục tạo request vô hạn; nhiều tab/người dùng có thể làm tăng tải API.
- **Hướng xử lý khi được duyệt:** Có deadline/backoff, dừng polling tự động sau thời gian hợp lý, hiển thị trạng thái chờ và cho phép kiểm tra thủ công. Vẫn phải cho phép người dùng refresh trạng thái sau đó.
