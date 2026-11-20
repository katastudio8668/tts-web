# CR-WEB-005 — Bổ sung kiểm thử generation, billing và session lifecycle

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — đã bổ sung test, chờ chạy test suite  
> **Nhóm:** Coding Rule / Test Coverage

> Ngày sửa: 2026-11-20 (UTC+07:00)  
> Branch: `main`

## Kiểm thử đã bổ sung

- `src/features/generation/useGenerationStudio.test.tsx`: tải danh sách voice, gửi payload generation và xác nhận retry cùng payload giữ nguyên `Idempotency-Key`.
- `src/features/generation/generationRequest.test.ts`: cùng payload tái sử dụng request key; thay đổi payload sinh key mới.
- `src/pages/PaymentResultPage.test.tsx`: hiển thị trạng thái PAID và PENDING; xác nhận nội dung chờ IPN VNPay.
- `src/features/auth/AuthProvider.test.tsx`: sign-out thành công xóa cache; sign-out lỗi giữ cache của phiên hiện tại; tiếp tục kiểm tra cache được xóa khi principal thay đổi hoặc sign-out event đến.
- Giữ test hiện có cho generation/payment polling, billing purchase intent, billing sections và API transport.

## Hồ sơ commit

- `20aa781`, `9dcd015`: generation studio integration test.
- `421b9ba`: payment result component tests.
- `1603266`, `9e1c552`: auth sign-out success/failure tests; follow-up correction keeps all cases inside the test suite.
- `be6e263`, `eb7bbdf`: generation request intent và test retry.
- `33ed573`, `d245ecd`, `99d54ef`: generation/billing presentation tests.

## Xác minh

- Đã rà soát các test hiện có và bổ sung các luồng còn thiếu nêu trên.
- Chưa chạy test suite trong môi trường này; trạng thái giữ ở FIXED, chưa nâng VERIFIED.
