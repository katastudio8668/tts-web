# Fixed Bugs — KATA TTS Web

> Cập nhật: 2026-11-20

| Bug | Mức độ | Thời điểm sửa | Trạng thái xác minh |
|---|---|---|---|
| [AP-WEB-006 — Retry generation tái sử dụng idempotency key](ap-web-006.md) | HIGH | 2026-11-19 18:49:38 +07:00 | FIXED — chờ CI/browser |
| [AP-WEB-003 — API URL production không còn fallback localhost](ap-web-003.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ CI/test + production smoke test |
| [AP-WEB-008 — Query cache được xóa khi đổi tài khoản hoặc đăng xuất](ap-web-008.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ CI/test + browser verification |
| [AP-WEB-001 — Retry mua credit tái sử dụng Idempotency-Key](ap-web-001.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ test + API/browser verification |
| [AP-WEB-002 — Polling trạng thái thanh toán có giới hạn](ap-web-002.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser/API verification |
| [AP-WEB-007 — Polling generation có deadline và backoff](ap-web-007.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser/API verification |
| [AP-WEB-004 — PlansPage tách hook dữ liệu và UI sections](ap-web-004.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ test + browser verification |
| [AP-WEB-005 — fetchAudio dùng chung transport và ApiError policy](ap-web-005.md) | HIGH | 2026-11-20 (UTC+07:00) | FIXED — chờ test + API/browser verification |
| [CR-WEB-001 — Xóa import Usage không sử dụng](cr-web-001.md) | MEDIUM | 2026-11-20 (UTC+07:00) | FIXED — source diff verified; chờ typecheck |
| [CR-WEB-003 — ESLint enforce unused variables thành lỗi](cr-web-003.md) | MEDIUM | 2026-11-20 (UTC+07:00) | FIXED — chờ CI |
| [CR-WEB-006 — Phân định feature module và layer trong frontend](cr-web-006.md) | MEDIUM | 2026-11-20 (UTC+07:00) | FIXED — chờ test/typecheck |
| [CR-WEB-005 — Bổ sung test generation, billing và session lifecycle](cr-web-005.md) | MEDIUM | 2026-11-20 (UTC+07:00) | FIXED — chờ chạy test suite |
| [CR-WEB-002 — Chuẩn hóa định dạng frontend bằng Prettier](cr-web-002.md) | MEDIUM | 2026-11-20 (UTC+07:00) | FIXED — chờ chạy format check |

## Quy trình

1. Bug còn mở được quản lý trong `../bugs/`, mỗi bug một file.
2. Khi sửa xong, chuyển nguyên file mô tả sang `fixed-bugs/`.
3. Cập nhật `../bugs/README.md` và danh sách này trong cùng đợt thay đổi.
4. Ghi ngày giờ theo múi giờ `UTC+07:00`, branch/commit hoặc PR, cùng bằng chứng xác minh.
5. Chỉ nâng thành `VERIFIED` khi có test phù hợp; không đánh đồng sửa source với xác minh runtime.
