# AP-WEB-007 — Polling trạng thái generation có deadline và backoff

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy test và xác minh browser/API  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/GeneratePage.tsx`, `src/features/generation/generationPolling.ts`.
- **Nguyên nhân trước khi sửa:** React Query refetch trạng thái job mỗi 2 giây liên tục trong khi trạng thái là `QUEUED` hoặc `RUNNING`, không có deadline.
- **Rủi ro:** Job bị kẹt hoặc worker không phản hồi khiến mỗi tab tiếp tục gọi API không giới hạn.
- **Cách sửa:** Đưa chính sách polling vào helper riêng. Polling tự động tối đa 5 phút cho mỗi generation job; chu kỳ tăng dần từ 2 giây lên 4, 8 và tối đa 10 giây. Khi hết hạn hoặc job chuyển sang trạng thái terminal, React Query dừng polling. Giao diện thông báo rõ tác vụ có thể vẫn đang xử lý và cung cấp nút kiểm tra thủ công. Đồng hồ được reset khi chuyển sang job khác.
- **Regression tests:** Thêm test cho chu kỳ backoff, mức trần 10 giây, deadline 5 phút và các trạng thái không được polling tại `src/features/generation/generationPolling.test.ts`.
- **Thời điểm sửa:** 2026-11-20 (UTC+07:00).
- **Commit helper:** `11d668f19086a750d04e40ea9d565b5e27d49bcf`.
- **Commit test:** `d3c8196ee97ad3c33014a42487d95bb73c8106bb`.
- **Commit source:** `e78c8e71a7c6311edc77f27b4f63bb2ce08e5441`, `ea59dad37218b97adb06f091fb11e8910202d34b`.
- **Xác minh:** Chưa chạy unit test, typecheck, lint, build hoặc browser/API test. Chưa có bằng chứng CI. Trạng thái giữ ở `FIXED`, không nâng thành `VERIFIED`.
