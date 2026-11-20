# AP-WEB-004 — PlansPage ôm nhiều trách nhiệm

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy test và xác minh browser/API  
> **Nhóm:** Anti-pattern

- **Phạm vi ban đầu:** `src/pages/PlansPage.tsx` chứa đồng thời bốn query (plans, usage, credit packages, payment orders), mutation mua credit, quản lý idempotency intent/trạng thái busy và toàn bộ UI billing.
- **Rủi ro:** Page component khó kiểm thử độc lập, thay đổi một khu vực billing dễ ảnh hưởng các khu vực còn lại.
- **Cách sửa:**
  - Chuyển query, mutation, idempotency intent, trạng thái mua và refresh cache vào hook `src/features/billing/usePlansBilling.ts`.
  - Tách UI thành `UsageBalanceCard`, `CreditPackagesSection`, `SubscriptionPlansSection`, `PaymentHistorySection` trong `src/features/billing/BillingSections.tsx`.
  - Giữ `PlansPage.tsx` làm composition layer; không thay đổi endpoint, query keys, chu kỳ refresh lịch sử 30 giây, payload mua hàng, Idempotency-Key hay điều hướng VNPay.
- **Regression tests:** Thêm `src/features/billing/BillingSections.test.tsx` kiểm tra chọn gói gọi đúng handler và lịch sử hiển thị trạng thái/link chi tiết. Logic tái sử dụng idempotency key tiếp tục được kiểm tra tại `purchaseIntent.test.ts`.
- **Thời điểm sửa:** 2026-11-20 (UTC+07:00).
- **Commit hook:** `d94858d1f4155ee06bac3cfe4f49f56c1047ecb8`.
- **Commit UI sections:** `909ddf4aa657de8415909de4ca8052767c665df0`.
- **Commit regression tests:** `4e8db2e592441a8c57e638d22ac44d49d3e2936c`.
- **Commit composition page:** `8cc3d8c4c9d938ab3e8f1f7ac72e4fec3a8d9e23`.
- **Xác minh:** Chưa chạy unit test, typecheck, lint, build hoặc browser/API test. Chưa có bằng chứng CI. Trạng thái giữ ở `FIXED`, không nâng thành `VERIFIED`.
