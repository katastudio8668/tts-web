# CR-WEB-001 — Import Usage không được sử dụng

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** FIXED — source change đã có trên main; chờ typecheck  
> **Nhóm:** Coding Rule

- **Phát hiện ban đầu:** `src/pages/PaymentResultPage.tsx` import `type Usage` nhưng không sử dụng; `tsconfig.app.json` bật `noUnusedLocals: true`.
- **Kết quả rà soát hiện tại:** Import `type Usage` không còn trong source hiện tại.
- **Bằng chứng:** Commit `7b0045a7d893a3df2ddb242d614163e271d95ee9` thay đổi import của `PaymentResultPage.tsx`, loại bỏ `type Usage` cùng lúc cập nhật logic polling thanh toán. Diff commit xác nhận chính xác dòng import cũ và dòng import mới.
- **Cách xử lý:** Không tạo thêm source commit vì lỗi đã được loại bỏ trên `main`; chuyển hồ sơ bug sang danh sách đã sửa để tránh sửa trùng.
- **Xác minh:** Source diff xác nhận import không dùng đã bị xóa. Chưa chạy typecheck/build, vì vậy giữ trạng thái `FIXED`, chưa nâng thành `VERIFIED`.
- **Thời điểm ghi nhận:** 2026-11-20 (UTC+07:00).
- **Commit source fix:** `7b0045a7d893a3df2ddb242d614163e271d95ee9`.
