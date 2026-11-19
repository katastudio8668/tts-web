# Bug Register — KATA TTS Web

> Cập nhật: 2026-11-19  
> Mỗi bug được quản lý trong một file riêng. Danh sách dưới đây là chỉ mục theo nhóm và mức ưu tiên.

## Tổng quan

| Nhóm | Số lượng | Ưu tiên |
|---|---:|---|
| Anti-pattern | 5 | HIGH |
| Coding Rule | 3 | MEDIUM |
| **Tổng** | **8** | |

## Anti-pattern — HIGH

| Bug | Ưu tiên | Trạng thái |
|---|---|---|
| [AP-WEB-001 — Tạo Idempotency-Key mới cho mỗi lần người dùng thử lại thanh toán](ap-web-001.md) | HIGH | OPEN |
| [AP-WEB-002 — Polling trạng thái thanh toán không có giới hạn thời gian](ap-web-002.md) | HIGH | OPEN |
| [AP-WEB-003 — API URL fallback về localhost có thể che giấu cấu hình production bị thiếu](ap-web-003.md) | HIGH | OPEN |
| [AP-WEB-004 — PlansPage là large component kiêm quá nhiều trách nhiệm](ap-web-004.md) | HIGH | OPEN |
| [AP-WEB-005 — API client chưa có chính sách quản lý response/error thống nhất cho fetchAudio](ap-web-005.md) | HIGH | OPEN |

## Coding Rule — MEDIUM

| Bug | Ưu tiên | Trạng thái |
|---|---|---|
| [CR-WEB-001 — Import Usage không được sử dụng](cr-web-001.md) | MEDIUM | OPEN |
| [CR-WEB-002 — Formatting không nhất quán, nhiều component dồn thành một dòng](cr-web-002.md) | MEDIUM | OPEN |
| [CR-WEB-003 — ESLint chưa enforce formatting và unused imports ở mức lỗi](cr-web-003.md) | MEDIUM | OPEN |

## Quy ước

- `OPEN`: đã ghi nhận, chưa sửa.
- `IN_PROGRESS`: đang xử lý.
- `FIXED`: đã sửa, chưa xác minh đầy đủ.
- `VERIFIED`: đã có bằng chứng kiểm thử phù hợp.
- Không chuyển sang `VERIFIED` chỉ dựa trên source review.
- Ưu tiên HIGH dành cho anti-pattern; MEDIUM dành cho coding-rule.
