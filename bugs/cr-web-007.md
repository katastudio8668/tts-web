# CR-WEB-007 — Nghe thử trong Studio không áp dụng tốc độ và tông giọng đã chọn

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — đã ghi nhận, chưa sửa  
> **Nhóm:** Coding Rule / Functional behavior

## Mô tả

Trong trang Studio tạo giọng nói, người dùng có thể thay đổi thanh **Tốc độ đọc** và chọn **Tông giọng** (Gốc, Ấm, Lạnh, Trầm, Trẻ, Mềm, Trong, Bass Boost...). Tuy nhiên nút **Nghe thử** vẫn phát audio preview mặc định đã lưu sẵn theo voice, không phản ánh các lựa chọn hiện tại.

## Cách tái hiện

1. Mở trang Studio tạo giọng nói và chọn một voice.
2. Đổi tốc độ đọc, ví dụ 2.00×.
3. Chọn một tông giọng khác Gốc, ví dụ Ấm hoặc Trầm.
4. Nhấn **Nghe thử** ở khu vực nút tạo giọng.
5. So sánh audio phát ra với lựa chọn tốc độ và tông giọng vừa chọn.

## Kết quả hiện tại

- Hook `useVoicePreview` chỉ gọi `GET /voices/:voiceId/preview`, không gửi tốc độ hoặc tông giọng.
- Audio preview được cache theo `voiceId` trong Map và phát lại từ object URL đã cache.
- `GeneratePage` truyền `preview.toggle(voiceId)` cho cả nút nghe thử trong VoicePicker và nút nghe thử chính; không truyền `speed` hoặc setting tông giọng.
- Endpoint preview phía API phục vụ sample đã tổng hợp/lưu sẵn theo voice. Vì vậy thay đổi tốc độ hoặc tông giọng trong giao diện không làm thay đổi sample đang nghe.

## Kết quả mong muốn

- Nút **Nghe thử** chính phải phát đúng voice, tốc độ và tông giọng đang chọn, không cần tạo generation job tính credit.
- Khi thay đổi voice/tốc độ/tông giọng, preview cũ không được tái sử dụng sai cấu hình.
- Có thể giữ preview mặc định miễn phí trong VoicePicker; cần phân biệt rõ với preview cấu hình hiện tại ở Studio.
- Không được ghi nhận usage hoặc trừ credit cho thao tác nghe thử.
- Có trạng thái loading/error và hủy request/cleanup audio khi người dùng đổi lựa chọn hoặc rời trang.

## Phạm vi cần kiểm tra khi sửa

- `src/pages/GeneratePage.tsx`
- `src/features/generation/useVoicePreview.ts` và test tương ứng
- `src/features/voice-tone/useVoiceTone.ts`
- API preview / engine synthesis nếu cần hỗ trợ preview theo tham số.
- Bảo đảm preview theo cấu hình không làm thay đổi voice tone setting account-wide ngoài ý muốn.

## Kiểm thử hồi quy cần bổ sung

1. Chọn voice, tốc độ khác 1.0× và tông giọng khác Gốc; preview phải dùng đủ ba lựa chọn.
2. Thay đổi tốc độ/tông giọng rồi nghe lại; không phát object URL cache của cấu hình cũ.
3. Chọn lại cùng cấu hình; có thể tái sử dụng cache chỉ khi cache key bao gồm toàn bộ tham số ảnh hưởng audio.
4. Nghe preview không tạo `GenerationJob`, không tiêu thụ free credits và không trừ paid credits.
5. Preview mặc định trong VoicePicker vẫn hoạt động độc lập nếu sản phẩm tiếp tục giữ hành vi đó.

## Ghi chú

Đây là lỗi hành vi được xác nhận từ luồng frontend hiện tại qua source review. Chưa có regression test hoặc browser verification cho bản sửa; không đánh dấu FIXED/VERIFIED trước khi triển khai và kiểm thử.
