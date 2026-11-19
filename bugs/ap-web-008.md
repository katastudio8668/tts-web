# AP-WEB-008 — Query cache không được phân tách/xóa khi đổi tài khoản

> **Ưu tiên:** HIGH  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Anti-pattern

- **Files:** `src/App.tsx`; `src/features/auth/AuthProvider.tsx`; các query ở `src/pages/*.tsx`.
- **Phát hiện:** QueryClient là singleton toàn ứng dụng; các query chứa dữ liệu cá nhân dùng key chung như `['usage']`, `['me']`, `['generations']`, `['payment-orders']` mà không gắn user ID. `signOut()` không xóa cache và không có xử lý đổi principal.
- **Rủi ro:** Nếu người dùng đăng xuất rồi đăng nhập tài khoản khác trên cùng trình duyệt trong thời gian cache còn fresh (staleTime 15 giây), dữ liệu cũ có thể được hiển thị cho tài khoản mới trước khi refetch; nếu cache vẫn fresh thì refetch có thể chưa diễn ra ngay.
- **Hướng xử lý:** Xóa cache cá nhân khi sign-out/session đổi hoặc đưa user ID vào query keys; bảo đảm không render dữ liệu của principal trước đó trong lúc chuyển tài khoản. Thêm test đổi user trên cùng QueryClient.
