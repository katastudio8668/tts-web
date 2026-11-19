# Fixed Bugs — KATA TTS Web

> Cập nhật: 2026-11-19

| Bug | Mức độ | Thời điểm sửa | Trạng thái xác minh |
|---|---|---|---|
| [AP-WEB-006 — Retry generation tái sử dụng idempotency key](ap-web-006.md) | HIGH | 2026-11-19 18:48:40 +07:00 | FIXED — chờ CI/browser |


## Quy trình

1. Bug còn mở được quản lý trong `../bugs/`, mỗi bug một file.
2. Khi sửa xong, chuyển nguyên file mô tả sang `fixed-bugs/`.
3. Cập nhật `../bugs/README.md` và danh sách này trong cùng đợt thay đổi.
4. Ghi ngày giờ theo múi giờ `UTC+07:00`, branch/commit hoặc PR, cùng bằng chứng xác minh.
5. Chỉ nâng thành `VERIFIED` khi có test phù hợp; không đánh đồng sửa source với xác minh runtime.
