# AP-WEB-004 — PlansPage là large component kiêm quá nhiều trách nhiệm

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

- **Ưu tiên:** HIGH
- **File:** `src/pages/PlansPage.tsx`
- **Phát hiện:** Một component quản lý nhiều query (plans, usage, packages, orders), mutation thanh toán, trạng thái busy và render toàn bộ các khu vực billing/history.
- **Rủi ro:** Khó test độc lập, khó kiểm soát loading/error state và tăng xác suất regression khi thay đổi billing.
- **Hướng xử lý khi được duyệt:** Tách query/mutation thành hooks và chia UI thành các component có trách nhiệm rõ ràng; không tạo abstraction dư thừa.
