# CR-WEB-001 — Import Usage không được sử dụng

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Coding Rule

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Mức ưu tiên theo yêu cầu: **MEDIUM** cho coding-rule. Chưa sửa source code.

- **Ưu tiên:** MEDIUM
- **File:** `src/pages/PaymentResultPage.tsx:1`
- **Phát hiện:** Import `type Usage` nhưng component không sử dụng symbol này.
- **Ảnh hưởng:** `tsconfig.app.json` bật `noUnusedLocals: true`; TypeScript có thể báo TS6133 và làm typecheck/build thất bại.
- **Hướng xử lý:** Xóa import không dùng hoặc sử dụng đúng type nếu thực sự cần. Xác minh bằng typecheck của frontend.
