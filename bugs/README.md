# Bug Register — KATA TTS Web

> Cập nhật: 2026-11-19  
> Mỗi bug được quản lý trong một file riêng. Danh sách dưới đây là chỉ mục theo nhóm và mức ưu tiên.

## Tổng quan

| Nhóm | Số lượng | Ưu tiên |
|---|---:|---|
| Anti-pattern | 8 | HIGH |
| Coding Rule | 5 | MEDIUM |
| **Tổng** | **13** | |

## Anti-pattern — HIGH

| Bug | Ưu tiên | Trạng thái |
|---|---|---|
| [AP-WEB-001 — Retry mua credit dùng idempotency key mới](ap-web-001.md) | HIGH | OPEN |
| [AP-WEB-002 — Polling trạng thái thanh toán không giới hạn](ap-web-002.md) | HIGH | OPEN |
| [AP-WEB-003 — API URL fallback localhost trong production](ap-web-003.md) | HIGH | OPEN |
| [AP-WEB-004 — PlansPage ôm nhiều trách nhiệm](ap-web-004.md) | HIGH | OPEN |
| [AP-WEB-005 — fetchAudio chưa dùng chung error/transport policy](ap-web-005.md) | HIGH | OPEN |
| [AP-WEB-006 — Retry generation dùng idempotency key mới](ap-web-006.md) | HIGH | OPEN |
| [AP-WEB-007 — Polling generation không giới hạn](ap-web-007.md) | HIGH | OPEN |
| [AP-WEB-008 — Query cache không tách/xóa khi đổi tài khoản](ap-web-008.md) | HIGH | OPEN |

## Coding Rule — MEDIUM

| Bug | Ưu tiên | Trạng thái |
|---|---|---|
| [CR-WEB-001 — Import Usage không sử dụng](cr-web-001.md) | MEDIUM | OPEN |
| [CR-WEB-002 — Formatting không nhất quán](cr-web-002.md) | MEDIUM | OPEN |
| [CR-WEB-003 — ESLint chưa enforce unused imports/formatting](cr-web-003.md) | MEDIUM | OPEN |
| [CR-WEB-004 — Không có lockfile cho dependency frontend](cr-web-004.md) | MEDIUM | OPEN |
| [CR-WEB-005 — Thiếu test generation, billing và session lifecycle](cr-web-005.md) | MEDIUM | OPEN |

## Quy ước

- `OPEN`: đã ghi nhận, chưa sửa.
- `IN_PROGRESS`: đang xử lý.
- `FIXED`: đã sửa, chưa xác minh đầy đủ.
- `VERIFIED`: đã có bằng chứng kiểm thử phù hợp.
- Không chuyển sang `VERIFIED` chỉ dựa trên source review.
- Ưu tiên HIGH dành cho anti-pattern; MEDIUM dành cho coding-rule theo yêu cầu.
