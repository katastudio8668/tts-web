# AP-WEB-010 — Payment history polling chạy cả khi không có đơn chờ

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — chờ test/runtime verification  
> **Nhóm:** Network behavior và performance  
> **Ngày sửa:** 2026-11-20 (UTC+07:00)

## Phát hiện

`usePlansBilling` đặt `refetchInterval: 30_000` cố định cho danh sách đơn thanh toán. Vì vậy trang Gói & sử dụng tiếp tục gọi API mỗi 30 giây kể cả khi toàn bộ đơn đã ở trạng thái kết thúc hoặc người dùng chưa từng tạo đơn.

## Ảnh hưởng

Gây request nền không cần thiết, tiêu tốn băng thông/tài nguyên API và làm tăng hoạt động mạng khi người dùng chỉ mở trang để xem số dư hoặc gói dịch vụ.

## Cách sửa

- Thêm policy `getPaymentOrdersRefreshInterval`.
- Chỉ refresh mỗi 30 giây khi danh sách có ít nhất một đơn `PENDING`.
- Dừng refresh khi danh sách rỗng hoặc tất cả đơn đã kết thúc.

## Regression test

- `src/features/billing/paymentOrdersRefresh.test.ts`: kiểm tra danh sách có pending tiếp tục refresh; danh sách không pending, rỗng hoặc chưa có dữ liệu thì dừng.

## Commits

- `e58dc1958c000bc84b50c5451944883dbc446d9e` — thêm policy refresh.
- `e7f24e5b7f016848b12c7fb444604c341e8b7c6b` — regression tests.
- `43ebdb02511b463b80419995f00dac77966906f4` — áp dụng policy vào billing hook.

## Xác minh

Source và regression test đã được commit. Chưa đánh dấu VERIFIED vì chưa chạy test suite/typecheck.
