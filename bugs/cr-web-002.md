# CR-WEB-002 — Formatting không nhất quán, nhiều component dồn thành một dòng

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Coding Rule

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Mức ưu tiên theo yêu cầu: **MEDIUM** cho coding-rule. Chưa sửa source code.

- **Ưu tiên:** MEDIUM
- **Files tham chiếu:** `src/pages/PlansPage.tsx`, `src/pages/PaymentResultPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/HistoryPage.tsx`, `src/lib/api.ts`, `src/features/auth/AuthProvider.tsx`
- **Phát hiện:** Nhiều file TSX/TS gần như minified, thiếu line breaks và bố cục thống nhất.
- **Ảnh hưởng:** Khó đọc/review diff, khó định vị lỗi và tăng chi phí bảo trì.
- **Hướng xử lý:** Chốt Prettier hoặc formatter tương đương; thêm format check vào CI. Chỉ format file khi có phạm vi thay đổi được duyệt để tránh diff không cần thiết.
