# Bug Register — KATA TTS Web

> Cập nhật: 2026-11-20 (UTC+07:00)  
> Mỗi bug được quản lý trong một file riêng. Danh sách dưới đây là chỉ mục theo nhóm và mức ưu tiên.

## Tổng quan

| Nhóm | Số lượng | Ưu tiên |
|---|---:|---|
| Anti-pattern đang mở | 0 | HIGH |
| Đã sửa (xem fixed-bugs) | 10 | HIGH |
| Coding Rule / Architecture | 6 | MEDIUM |
| **Tổng số bug đã ghi nhận** | **16** | |
| **Còn mở** | **1** | |

## Anti-pattern — HIGH

| Bug | Ưu tiên | Trạng thái |
|---|---|---|


## Đã sửa — HIGH

| Bug | Thời điểm sửa | Trạng thái |
|---|---|---|
| [AP-WEB-006 — Retry generation tái sử dụng idempotency key](../fixed-bugs/ap-web-006.md) | 2026-11-19 18:49:38 +07:00 | FIXED — chờ CI/browser |
| [AP-WEB-003 — API URL production không còn fallback localhost](../fixed-bugs/ap-web-003.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ CI/test + production smoke test |
| [AP-WEB-008 — Query cache được xóa khi đổi tài khoản hoặc đăng xuất](../fixed-bugs/ap-web-008.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ CI/test + browser verification |
| [AP-WEB-001 — Retry mua credit tái sử dụng Idempotency-Key](../fixed-bugs/ap-web-001.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + API/browser verification |
| [AP-WEB-002 — Polling trạng thái thanh toán có giới hạn](../fixed-bugs/ap-web-002.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser/API verification |
| [AP-WEB-007 — Polling generation có deadline và backoff](../fixed-bugs/ap-web-007.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser/API verification |
| [AP-WEB-004 — PlansPage tách hook dữ liệu và UI sections](../fixed-bugs/ap-web-004.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser verification |
| [AP-WEB-005 — fetchAudio dùng chung transport và ApiError policy](../fixed-bugs/ap-web-005.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + API/browser verification |
| [AP-WEB-009 — Protected workspace reset khi đổi tài khoản](../fixed-bugs/ap-web-009.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser verification |
| [AP-WEB-010 — Payment history chỉ refresh khi có đơn pending](../fixed-bugs/ap-web-010.md) | 2026-11-20 (UTC+07:00) | FIXED — chờ test verification |

## Coding Rule / Architecture — MEDIUM

| Bug | Ưu tiên | Trạng thái |
|---|---|---|
| [CR-WEB-004 — Không có lockfile cho dependency frontend](cr-web-004.md) | MEDIUM | OPEN |

## Đã sửa — MEDIUM

| Bug | Mức độ | Trạng thái |
|---|---|---|
| [CR-WEB-001 — Xóa import Usage không sử dụng](../fixed-bugs/cr-web-001.md) | MEDIUM | FIXED — chờ typecheck |
| [CR-WEB-003 — ESLint enforce unused variables thành lỗi](../fixed-bugs/cr-web-003.md) | MEDIUM | FIXED — chờ CI |
| [CR-WEB-006 — Phân định feature module và layer trong frontend](../fixed-bugs/cr-web-006.md) | MEDIUM | FIXED — chờ test/typecheck |
| [CR-WEB-005 — Bổ sung test generation, billing và session lifecycle](../fixed-bugs/cr-web-005.md) | MEDIUM | FIXED — chờ chạy test suite |
| [CR-WEB-002 — Chuẩn hóa định dạng frontend bằng Prettier](../fixed-bugs/cr-web-002.md) | MEDIUM | FIXED — chờ chạy format check |

## Quy ước

- `OPEN`: đã ghi nhận, chưa sửa.
- Bug đã sửa được chuyển khỏi thư mục này sang `../fixed-bugs/`; không xóa hồ sơ bug.
- `IN_PROGRESS`: đang xử lý.
- `FIXED`: đã sửa, chưa xác minh đầy đủ.
- `VERIFIED`: đã có bằng chứng kiểm thử phù hợp.
- Không chuyển sang `VERIFIED` chỉ dựa trên source review.
- Khi xử lý xong, cập nhật cả hai index và ghi commit, thời điểm UTC+07:00, cùng bằng chứng.
- Ưu tiên HIGH dành cho anti-pattern; MEDIUM dành cho coding-rule/architecture theo yêu cầu.
