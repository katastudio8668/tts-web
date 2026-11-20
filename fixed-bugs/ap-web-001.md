# AP-WEB-001 — Retry mua credit tái sử dụng Idempotency-Key

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy test và xác minh API/browser  
> **Nhóm:** Anti-pattern

- **File:** `src/pages/PlansPage.tsx`, `src/features/billing/purchaseIntent.ts`.
- **Nguyên nhân trước khi sửa:** Idempotency key được tạo bên trong `mutationFn`, khiến mỗi lần retry cùng thao tác mua gửi một key mới.
- **Rủi ro:** Request đầu có thể đã tạo đơn ở backend nhưng response bị mất/timeout; request retry với key mới có thể tạo đơn thanh toán trùng.
- **Cách sửa:** Lưu purchase intent gồm mã gói và idempotency key ở state của trang. Khi request lỗi, giữ nguyên intent để lần bấm thử lại cùng gói tái sử dụng key. Chọn gói khác tạo intent/key mới. Khi backend trả về tạo đơn thành công, xóa intent để lần mua tiếp theo là giao dịch mới.
- **Regression tests:** Thêm test cho việc retry cùng gói dùng lại key và chọn gói khác tạo key mới tại `src/features/billing/purchaseIntent.test.ts`.
- **Thời điểm sửa:** 2026-11-20 (UTC+07:00).
- **Commit source:** `e5c9da0ea14546f8a79887279c9d94e7fa24bf0a`.
- **Commit test/helper:** `275fb0274d0b7908a114ed3a730656866f4e0208`, `321064174d73090ad8cef8a65c3c5c8d6d0c52be`.
- **Xác minh:** Chưa chạy unit test, typecheck, lint, build hoặc browser/API test. Chưa có bằng chứng CI. Trạng thái giữ ở `FIXED`, không nâng thành `VERIFIED`.
- **Lưu ý:** Cơ chế bảo vệ cuối cùng vẫn phụ thuộc backend thực thi idempotency theo header `Idempotency-Key`; thay đổi này bảo đảm frontend gửi lại đúng key cho cùng purchase intent.
