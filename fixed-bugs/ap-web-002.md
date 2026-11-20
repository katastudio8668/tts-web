# AP-WEB-002 — Polling trạng thái thanh toán có giới hạn

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy test và xác minh browser/API  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/PaymentResultPage.tsx`, `src/features/billing/paymentPolling.ts`.
- **Nguyên nhân trước khi sửa:** Query tiếp tục gọi API mỗi 5 giây trong toàn bộ thời gian đơn ở trạng thái `PENDING`, không có deadline.
- **Rủi ro:** Người dùng để trang mở lâu hoặc mở nhiều tab có thể tạo lượng request polling kéo dài không cần thiết.
- **Cách sửa:** Giới hạn polling tự động ở 2 phút kể từ lúc mở trang cho mã đơn hiện tại; vẫn giữ chu kỳ 5 giây trong khoảng đó. Khi hết thời hạn, React Query nhận `false` và dừng polling. Giao diện thông báo đã dừng tự động và giữ nút làm mới thủ công để người dùng chủ động kiểm tra sau đó. Khi đổi mã đơn, đồng hồ polling được khởi tạo lại.
- **Regression tests:** Thêm test kiểm tra polling tiếp tục trong thời hạn, dừng đúng mốc 2 phút, và không polling khi trạng thái terminal hoặc đồng hồ chưa khởi động tại `src/features/billing/paymentPolling.test.ts`.
- **Thời điểm sửa:** 2026-11-20 (UTC+07:00).
- **Commit source:** `7b0045a7d893a3df2ddb242d614163e271d95ee9`.
- **Commit test/helper:** `e1045ab9991e22080e2861ead230c1e4ee8051de`, `18f5820ed3389bf534050794d21e2b859bbc7b8f`.
- **Xác minh:** Chưa chạy unit test, typecheck, lint, build hoặc browser/API test. Chưa có bằng chứng CI. Trạng thái giữ ở `FIXED`, không nâng thành `VERIFIED`.
