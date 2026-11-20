# AP-WEB-009 — Protected workspace không reset khi đổi tài khoản

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ test/runtime verification  
> **Nhóm:** Authentication, privacy và account isolation  
> **Ngày sửa:** 2026-11-20 (UTC+07:00)

## Phát hiện

`AuthProvider` xóa TanStack Query cache khi principal thay đổi, nhưng `ProtectedLayout` giữ nguyên `AppShell` và toàn bộ route con. Các page như GeneratePage có local state riêng (nội dung nhập, job đang xem, audio object URL, trạng thái tải và idempotency intent); cache clear không xóa các state này.

## Tình huống kích hoạt

1. Tài khoản A đăng nhập và mở Studio tạo giọng nói.
2. A tạo hoặc tải audio, khiến page giữ job/audio URL trong local state.
3. Phiên đăng nhập chuyển sang tài khoản B mà ứng dụng không reload.
4. Route tree vẫn mounted, nên dữ liệu phiên A có thể tiếp tục hiển thị trong workspace của B.

## Ảnh hưởng

Dữ liệu và audio của tài khoản trước có thể còn xuất hiện trong giao diện sau khi chuyển tài khoản trên cùng trình duyệt. Đây là lỗi cô lập dữ liệu giữa các principal ở frontend, dù query cache đã được xóa.

## Nguyên nhân gốc

`ProtectedLayout` chỉ kiểm tra `session` có tồn tại, không đặt identity boundary cho subtree đã xác thực. Vì vậy React không remount `AppShell` khi `session.user.id` đổi.

## Cách sửa

- Gắn `key={session.user.id}` cho `AppShell` trong `ProtectedLayout`.
- Khi user ID đổi, React unmount workspace cũ và mount workspace mới; local state, audio object URL và state của các feature page cũ được dọn theo lifecycle.
- Giữ nguyên việc `AuthProvider` clear QueryClient khi principal đổi.

## Regression test

- `src/App.session-boundary.test.tsx`: thay user ID từ A sang B phải remount protected subtree và reset state cục bộ.

## Commits

- `e1d3a8318501cc09f25f35f5ef716f36598639c7` — remount protected workspace theo user ID.
- `b94e79021b2545425139ff7dcbb5d979694c1858`, `2bb2280a0e2f1fb37de07aa19450472a2bd70e45` — regression test.

## Xác minh

Source đã cập nhật. Chưa đánh dấu VERIFIED vì chưa chạy test suite/typecheck và chưa thực hiện browser account-switch smoke test.
