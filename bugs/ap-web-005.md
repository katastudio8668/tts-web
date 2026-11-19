# AP-WEB-005 — API client chưa có chính sách quản lý response/error thống nhất cho fetchAudio

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

- **Ưu tiên:** HIGH
- **File:** `src/lib/api.ts`
- **Phát hiện:** `apiRequest` chuẩn hóa lỗi mạng/timeout, nhưng `fetchAudio` dùng fetch riêng, chỉ kiểm tra response status và timeout cố định; chưa áp dụng cùng error normalization/retry/cancellation contract.
- **Rủi ro:** UI có thể xử lý lỗi audio khác với lỗi API thông thường; khó thống nhất telemetry và retry behavior.
- **Hướng xử lý khi được duyệt:** Chuẩn hóa transport/error handling; giữ riêng xử lý binary response nhưng dùng chung timeout, cancellation và error model.
