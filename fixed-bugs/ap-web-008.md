# AP-WEB-008 — Query cache được xóa khi đổi tài khoản hoặc đăng xuất

> **Ưu tiên:** HIGH  
> **Trạng thái:** FIXED — chờ CI/test và browser verification  
> **Nhóm:** Anti-pattern

## Phạm vi và thay đổi

- **Branch:** `main`
- **Regression test commit:** `94a228736c61f21d7776fb9a3399fb2a343f9ccf`
- **Fix commit:** `c8b44d35a83ad75e8321128231252810440514f0`
- **Files sửa:** `src/features/auth/AuthProvider.tsx`
- **File test:** `src/features/auth/AuthProvider.test.tsx`
- **Thời điểm:** 2026-11-20 (UTC+07:00)

## Nguyên nhân

QueryClient dùng chung toàn ứng dụng, trong khi query key cho dữ liệu cá nhân như `['usage']`, `['me']`, `['generations']` và `['payment-orders']` không mang user ID. Trước đây AuthProvider không xóa cache khi principal thay đổi hoặc đăng xuất.

## Cách sửa

- AuthProvider lấy QueryClient bằng `useQueryClient()` (đã được bọc bởi QueryClientProvider trong App).
- Theo dõi user ID hiện tại; khi auth event chuyển sang user khác hoặc signed-out, gọi `queryClient.clear()` **trước** khi cập nhật session state.
- Bỏ qua kết quả `getSession()` cũ nếu auth event đã đến, tránh response khởi tạo ghi đè trạng thái session mới.
- Sau khi `signOut()` thành công, xóa cache ngay, không phụ thuộc thời điểm auth event được phát.
- Không xóa cache khi token refresh hoặc auth event vẫn thuộc cùng user.
- Bổ sung regression tests cho đổi user A → user B và sign-out, kiểm tra cache cá nhân bị xóa.

## Bằng chứng và giới hạn xác minh

- Test được thêm trước thay đổi source ở commit `94a228736c61f21d7776fb9a3399fb2a343f9ccf`.
- Fix source được ghi ở commit `c8b44d35a83ad75e8321128231252810440514f0`.
- **Chưa chạy được** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` hoặc browser test trong phiên này.
- Do chưa có output thực thi, trạng thái giữ ở `FIXED`, không nâng lên `VERIFIED`.

## Tiêu chí hoàn tất xác minh

1. Regression test chứng minh cache bị xóa khi user A chuyển sang user B.
2. Regression test chứng minh cache bị xóa khi sign-out.
3. Xác nhận token refresh cùng user không làm mất cache ngoài ý muốn.
4. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` đều pass.
5. Browser smoke test: đăng nhập A, tải dữ liệu cá nhân, đăng xuất, đăng nhập B; không xuất hiện dữ liệu A trong lúc chuyển tài khoản hoặc trước refetch.
