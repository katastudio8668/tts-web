# CR-WEB-006 — Phân định feature module và layer trong frontend

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — chờ chạy test/typecheck  
> **Nhóm:** Coding Rule / Architecture

> Ngày sửa: 2026-11-20 (UTC+07:00)  
> Branch: `main`

## Thay đổi

- Tách toàn bộ query/mutation, idempotency, polling, timeout và quản lý audio URL khỏi `GeneratePage` vào `src/features/generation/useGenerationStudio.ts`. Route page hiện tập trung vào presentation và composition.
- Tách quy tắc nhận diện request retry sang `generationRequest.ts`; cùng payload giữ nguyên idempotency key, payload thay đổi tạo key mới.
- Di chuyển `GenerationHistoryItem` từ `src/components` vào `src/features/generation`, cập nhật route lịch sử sử dụng component theo feature.
- Đưa nhãn trạng thái generation vào `generationPresentation.ts`; nhãn trạng thái payment và định dạng VND vào `billingPresentation.ts`. `src/lib/api.ts` không còn chứa helper presentation của hai feature.
- Billing đã có hook dữ liệu/mutation và các UI section riêng từ thay đổi AP-WEB-004; giữ nguyên API, query keys và hành vi hiện tại.

## Kiểm thử bổ sung

- `generationRequest.test.ts`: retry cùng payload tái sử dụng key; thay đổi payload tạo key mới.
- `generationPresentation.test.ts`: kiểm tra nhãn cho mọi trạng thái generation.
- `billingPresentation.test.ts`: kiểm tra nhãn trạng thái thanh toán và định dạng tiền VND.
- Giữ các test polling generation/payment và test billing đã có.

## Commit source chính

- `1c1` — tách workflow generation khỏi page.
- `0e3`, `13e`, `519` — chuyển component lịch sử vào feature generation.
- `78a`, `7ee`, `203`, `ccc`, `8af`, `590`, `d0e`, `a92` — tách presentation helper khỏi API transport và cập nhật import.
- `be6`, `1df`, `eb7`, `33e`, `d245`, `99d` — tách request intent và bổ sung unit tests.

## Xác minh

- Đã rà soát source và import usages trên `main`; component lịch sử không còn nằm trong shared components.
- Test/typecheck chưa được thực thi trong môi trường làm việc hiện tại. Trạng thái giữ ở FIXED, chưa nâng VERIFIED.
