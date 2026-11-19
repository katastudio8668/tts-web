# CR-WEB-004 — Repository không có lockfile cho dependency frontend

> **Ưu tiên:** MEDIUM  
> **Trạng thái:** OPEN — chưa sửa  
> **Nhóm:** Coding Rule

- **Files:** `package.json`, `.github/workflows/ci.yml`; root repository không có `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml` hoặc `yarn.lock`.
- **Phát hiện:** CI dùng `npm install` và dependency chỉ được ràng buộc bằng semver range trong package.json; không có lockfile được commit.
- **Ảnh hưởng:** Các lần cài dependency có thể giải quyết ra các phiên bản khác nhau, làm kết quả build/test khó tái lập và tăng nguy cơ regression ngoài ý muốn.
- **Hướng xử lý:** Commit lockfile phù hợp với npm, đổi CI sang `npm ci` và cập nhật lockfile khi có thay đổi dependency có chủ đích.
