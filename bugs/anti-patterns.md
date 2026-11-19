# Anti-pattern bugs — KATA TTS Web

> Ngày rà soát: 2026-11-19  
> Phạm vi: source trên `main`, commit được kiểm tra: `6c5d4ac46db0ef34f919bc1d09dbd47b71dd6f45`.  
> Đây là source review, chưa chạy browser/e2e/load test. Chưa sửa source code.

## AP-WEB-001 — Tạo Idempotency-Key mới cho mỗi lần người dùng thử lại thanh toán

- **Ưu tiên:** HIGH
- **File:** `src/pages/PlansPage.tsx:3`
- **Phát hiện:** `crypto.randomUUID()` được tạo bên trong `mutationFn`; mỗi lần gọi mutation tạo key mới.
- **Rủi ro:** Nếu request trước đã tạo đơn ở server nhưng response bị mất/timeout, lần bấm mua tiếp theo gửi key mới và có thể tạo thêm đơn cho cùng ý định mua.
- **Hướng xử lý khi được duyệt:** Tạo và giữ key theo một purchase intent; tái sử dụng key khi retry cùng request, chỉ tạo key mới khi người dùng chủ động bắt đầu giao dịch mới.

## AP-WEB-002 — Polling trạng thái thanh toán không có giới hạn thời gian

- **Ưu tiên:** HIGH
- **File:** `src/pages/PaymentResultPage.tsx:2`
- **Phát hiện:** `refetchInterval` tiếp tục gọi API mỗi 5 giây miễn trạng thái là `PENDING`.
- **Rủi ro:** Tab để mở lâu có thể tiếp tục tạo request vô hạn; nhiều tab/người dùng có thể làm tăng tải API.
- **Hướng xử lý khi được duyệt:** Có deadline/backoff, dừng polling tự động sau thời gian hợp lý, hiển thị trạng thái chờ và cho phép kiểm tra thủ công. Vẫn phải cho phép người dùng refresh trạng thái sau đó.

## AP-WEB-003 — API URL fallback về localhost có thể che giấu cấu hình production bị thiếu

- **Ưu tiên:** HIGH
- **File:** `src/lib/api.ts`
- **Phát hiện:** Khi `VITE_API_BASE_URL` rỗng, code tự dùng `http://localhost:3058/api/v1`.
- **Rủi ro:** Bản production có thể build/deploy thành công nhưng browser của người dùng lại gọi localhost trên máy họ.
- **Hướng xử lý khi được duyệt:** Fail-fast khi thiếu API URL ở production; chỉ dùng localhost trong môi trường development có chủ đích.

## AP-WEB-004 — PlansPage là large component kiêm quá nhiều trách nhiệm

- **Ưu tiên:** HIGH
- **File:** `src/pages/PlansPage.tsx`
- **Phát hiện:** Một component quản lý nhiều query (plans, usage, packages, orders), mutation thanh toán, trạng thái busy và render toàn bộ các khu vực billing/history.
- **Rủi ro:** Khó test độc lập, khó kiểm soát loading/error state và tăng xác suất regression khi thay đổi billing.
- **Hướng xử lý khi được duyệt:** Tách query/mutation thành hooks và chia UI thành các component có trách nhiệm rõ ràng; không tạo abstraction dư thừa.

## AP-WEB-005 — API client chưa có chính sách quản lý response/error thống nhất cho fetchAudio

- **Ưu tiên:** HIGH
- **File:** `src/lib/api.ts`
- **Phát hiện:** `apiRequest` chuẩn hóa lỗi mạng/timeout, nhưng `fetchAudio` dùng fetch riêng, chỉ kiểm tra response status và timeout cố định; chưa áp dụng cùng error normalization/retry/cancellation contract.
- **Rủi ro:** UI có thể xử lý lỗi audio khác với lỗi API thông thường; khó thống nhất telemetry và retry behavior.
- **Hướng xử lý khi được duyệt:** Chuẩn hóa transport/error handling; giữ riêng xử lý binary response nhưng dùng chung timeout, cancellation và error model.
