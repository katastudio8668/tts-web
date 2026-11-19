# CR-WEB-005 — Thiếu test cho các luồng generation, billing và session lifecycle

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Coding Rule

- **Files:** `src/App.test.tsx`, `src/lib/api.test.ts`, `src/pages/GeneratePage.tsx`, `src/pages/PlansPage.tsx`, `src/pages/PaymentResultPage.tsx`, `src/features/auth/AuthProvider.tsx`.
- **Phát hiện:** Test suite hiện có chỉ kiểm tra màn hình sign-in cơ bản và một số trường hợp của API client. Chưa thấy test cho submit/retry generation, polling job, mua credit/idempotency, kết quả VNPay, cache khi đổi user và sign-out failure.
- **Ảnh hưởng:** Các regression trong luồng có tác động đến credit, dữ liệu cá nhân và trạng thái thanh toán có thể lọt qua CI.
- **Hướng xử lý:** Bổ sung component/integration tests cho generation, payment và session lifecycle; mock API theo response/error và xác minh cache không rò dữ liệu giữa các user.
