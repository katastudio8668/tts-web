# AP-WEB-011 — Audio request không bị hủy khi rời trang

- **Mức độ:** HIGH
- **Trạng thái:** FIXED — chờ test/runtime verification
- **Branch:** `main`
- **Ngày sửa:** 2026-11-21 (UTC+07:00)

## Vấn đề

Hai luồng tải audio ở Studio và Lịch sử gọi `fetchAudio` mà không truyền `AbortSignal`. Khi người dùng chuyển trang hoặc đổi tài khoản trong lúc request đang chạy, component bị unmount nhưng request vẫn tiếp tục. Điều này có thể tải dữ liệu không còn cần thiết và tạo `ObjectURL` sau khi component đã rời khỏi màn hình; state update sau unmount cũng không còn ý nghĩa.

## Cách sửa

- Tạo `AbortController` cho mỗi lần tải audio và truyền signal vào `fetchAudio`.
- Hủy request khi component/hook unmount.
- Bỏ qua lỗi và state update phát sinh từ request đã bị hủy.
- Thu hồi ngay `ObjectURL` nếu request hoàn tất nhưng signal đã bị abort trước khi URL được gắn vào state.
- Hủy request tải audio cũ khi generation mới được tạo.

## Phạm vi

- `src/features/generation/useGenerationStudio.ts`
- `src/features/generation/GenerationHistoryItem.tsx`
- `src/features/generation/useGenerationStudio.test.tsx`

## Kiểm thử

Đã bổ sung regression test xác nhận request tải audio bị abort khi hook unmount. Chưa chạy test suite/typecheck/lint trong môi trường hiện tại; không đánh dấu VERIFIED cho đến khi có kết quả thực thi.
