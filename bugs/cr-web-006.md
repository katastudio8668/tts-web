# CR-WEB-006 — Chưa phân định rõ feature module và các layer trong FE

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — đã ghi nhận qua source review  
> **Nhóm:** Coding Rule / Architecture

> Ngày rà soát: 2026-11-20  
> Phạm vi: source trên `main`, commit baseline `77e4f0555360a1fa71ad64d03439f67ecbaa6386`.  
> Đây là source review; chưa sửa source code và chưa chạy browser/E2E.

- **Files:** `src/pages/GeneratePage.tsx`, `src/pages/PlansPage.tsx`, `src/lib/api.ts`, `src/components/GenerationHistoryItem.tsx`.
- **Phát hiện:**
  - `GeneratePage` đang đồng thời render toàn bộ workspace, giữ form/job/audio state, định nghĩa query/mutation, polling trạng thái, gọi tải audio và quản lý object URL.
  - `PlansPage` gom truy vấn plans/usage/packages/orders, mutation mua credit, trạng thái giao dịch và nhiều khu vực UI trong một page.
  - `src/lib/api.ts` đang chứa chung transport, API types, nhãn trạng thái nghiệp vụ, format tiền và tải binary audio.
  - `GenerationHistoryItem` là UI thuộc feature generation nhưng đang nằm trong thư mục components dùng chung.
- **Ảnh hưởng:** Ranh giới giữa route/presentation, orchestration/application, nghiệp vụ và infrastructure chưa rõ. Thay đổi một feature dễ tác động page/API dùng chung; khó kiểm thử độc lập và khó mở rộng mà không tạo God Page hoặc shared module quá tải.
- **Hướng xử lý:** Áp dụng kết hợp Modular + Layered + Atomic:
  1. Tách theo feature/bounded context (generation, billing/payment, auth); mỗi feature sở hữu UI, hooks/use-cases, API adapter và types/model liên quan.
  2. Trong mỗi feature, giữ chiều phụ thuộc presentation → application → domain → infrastructure; domain không phụ thuộc React, router hay HTTP.
  3. Dùng Atomic Design có chọn lọc trong presentation: atoms/molecules/organisms theo trách nhiệm và khả năng tái sử dụng; không tách component vụn hoặc tạo taxonomy hình thức.
  4. Chỉ đưa UI/utility/API transport thực sự dùng chung vào shared; page chủ yếu lắp ghép feature và xử lý route-level concerns.
  5. Refactor tăng dần theo từng bug/feature, không di chuyển toàn bộ source trong một đợt.
- **Tiêu chí hoàn tất:** Luồng generation và billing có ranh giới module rõ; page không trực tiếp ôm toàn bộ query/mutation/business workflow; API transport tách khỏi nhãn/format nghiệp vụ; tests bao phủ hooks/use-cases trọng yếu; typecheck/lint/test/build được chạy và ghi kết quả.
