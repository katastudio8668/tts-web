# AP-WEB-005 — fetchAudio chưa dùng chung error/transport policy

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ chạy test và xác minh browser/API  
> **Nhóm:** Anti-pattern

- **Phạm vi ban đầu:** `apiRequest` và `fetchAudio` có hai luồng `fetch` riêng. Luồng audio chỉ kiểm tra status, tự đặt timeout và không chuẩn hóa lỗi mạng, timeout, lỗi HTTP hoặc cancellation giống API JSON.
- **Rủi ro:** Cùng một lỗi mạng/HTTP có thể hiển thị khác nhau giữa API JSON và audio; việc hủy tác vụ không có contract nhất quán.
- **Cách sửa:**
  - Tạo transport dùng chung `requestResponse` trong `src/lib/api.ts`: chuẩn hóa Bearer header, timeout 30 giây, caller-provided AbortSignal, lỗi HTTP và lỗi mạng.
  - Chuẩn hóa HTTP error qua `ApiError` dùng chung; giữ nguyên các quy tắc thông điệp 401/402/429 và message array từ NestJS.
  - `apiRequest` tiếp tục parse JSON/204; `fetchAudio` tiếp tục đọc Blob và tạo object URL, không đổi binary response contract.
  - Kết hợp signal của caller với timeout; giữ nguyên cancellation chủ động (AbortError), chuẩn hóa timeout thành ApiError 408 và lỗi kết nối thành ApiError status 0. Lỗi khi đọc Blob cũng đi qua cùng chính sách.
  - Bổ sung tham số `RequestInit` tùy chọn cho `fetchAudio` để caller có thể hủy request.
- **Regression tests:** Mở rộng `src/lib/api.test.ts` để kiểm tra audio binary, Bearer token, HTTP message array, timeout, timeout signal trả về AbortError, caller cancellation và network error.
- **Thời điểm sửa:** 2026-11-20 (UTC+07:00).
- **Commit tests ban đầu:** `3cf814d8715f527525491496b4083b9096ee1aa0`.
- **Commit shared transport:** `afbbc1f8913c1284e13dfc942b1d7117fdae3c04`.
- **Commit normalize Blob/cancellation:** `7f07f97a7562da1f46f922064a99a91291ffac4f`.
- **Commit caller signal regression:** `079852181e436eefcfaa63fb81093ffadde4fb22`.
- **Commit timeout normalization:** `fe48ea1dd0d514ba9c7ff28156eb0ebd329c02cb`.
- **Commit timeout regression:** `41696006596c007d03679781374bb576cc1178e1`.
- **Commit tinh chỉnh assertion binary Blob:** `068a752811ee679f41c2b14b8b89bb946137f01f`.
- **Xác minh:** Chưa chạy unit test, typecheck, lint, build hoặc browser/API test. Chưa có bằng chứng CI. Trạng thái giữ ở `FIXED`, không nâng thành `VERIFIED`.
