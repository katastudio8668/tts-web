# CR-WEB-002 — Chuẩn hóa định dạng frontend bằng Prettier

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — chờ chạy format check  
> **Nhóm:** Coding Rule

> Ngày sửa: 2026-11-20 (UTC+07:00)  
> Branch: `main`

## Phạm vi source đã chuẩn hóa

- `src/pages/PlansPage.tsx`
- `src/pages/PaymentResultPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/HistoryPage.tsx`
- `src/lib/api.ts`
- `src/features/auth/AuthProvider.tsx`

Các file được format theo phạm vi đã ghi nhận; không chạy format toàn repository và không thay đổi logic nghiệp vụ có chủ đích.

## Quy tắc và lệnh

- Pin Prettier `3.6.2` trong devDependencies.
- Thêm `.prettierrc.json`: 2 spaces, single quotes, semicolons, trailing commas, print width 100.
- Thêm `npm run format` để format đúng sáu file trong phạm vi.
- Thêm `npm run format:check` để kiểm tra định dạng.
- CI gọi `npm run format:check` trước lint/typecheck/test/build.

## Xác minh

- Đã rà soát diff source và xác nhận phạm vi formatter được giới hạn ở sáu file nêu trên.
- Chưa chạy Prettier CLI hoặc pipeline trong môi trường này; trạng thái giữ FIXED, chưa nâng VERIFIED.
