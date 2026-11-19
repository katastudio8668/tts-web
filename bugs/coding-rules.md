# Coding-rule bugs — KATA TTS Web

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Mức ưu tiên theo yêu cầu: **MEDIUM** cho coding-rule. Chưa sửa source code.

## CR-WEB-001 — Import Usage không được sử dụng

- **Ưu tiên:** MEDIUM
- **File:** `src/pages/PaymentResultPage.tsx:1`
- **Phát hiện:** Import `type Usage` nhưng component không sử dụng symbol này.
- **Ảnh hưởng:** `tsconfig.app.json` bật `noUnusedLocals: true`; TypeScript có thể báo TS6133 và làm typecheck/build thất bại.
- **Hướng xử lý:** Xóa import không dùng hoặc sử dụng đúng type nếu thực sự cần. Xác minh bằng typecheck của frontend.

## CR-WEB-002 — Formatting không nhất quán, nhiều component dồn thành một dòng

- **Ưu tiên:** MEDIUM
- **Files tham chiếu:** `src/pages/PlansPage.tsx`, `src/pages/PaymentResultPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/HistoryPage.tsx`, `src/lib/api.ts`, `src/features/auth/AuthProvider.tsx`
- **Phát hiện:** Nhiều file TSX/TS gần như minified, thiếu line breaks và bố cục thống nhất.
- **Ảnh hưởng:** Khó đọc/review diff, khó định vị lỗi và tăng chi phí bảo trì.
- **Hướng xử lý:** Chốt Prettier hoặc formatter tương đương; thêm format check vào CI. Chỉ format file khi có phạm vi thay đổi được duyệt để tránh diff không cần thiết.

## CR-WEB-003 — ESLint chưa enforce formatting và unused imports ở mức lỗi

- **Ưu tiên:** MEDIUM
- **File:** `eslint.config.js`
- **Phát hiện:** `@typescript-eslint/no-unused-vars` đang ở mức warning; chưa thấy formatter check trong cấu hình ESLint.
- **Ảnh hưởng:** Coding-rule violations có thể không chặn CI nếu pipeline chỉ chạy lint và không chạy typecheck.
- **Hướng xử lý:** Chuyển các vi phạm chắc chắn thành error; bổ sung format check và bảo đảm CI chạy typecheck riêng.
