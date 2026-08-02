# Acceptance Criteria — V15.0.4

## Timeline bottom sheet scroll lock hotfix

- Khi mở `tl8FilterSheet` hoặc `tl8SortSheet`, thao tác kéo xuống không làm trang nền dịch chuyển.
- Khi bottom sheet đang mở, Pull-to-refresh không được kích hoạt và không được reload app.
- Scroll chỉ hoạt động trong phần nội dung của bottom sheet/modal.
- Kéo tới đầu/cuối nội dung sheet không được truyền tiếp sang nền phía sau.
- Đóng bottom sheet trả trang về đúng vị trí scroll trước đó.
- Version/cache được nâng lên `15.0.4` để tránh trình duyệt dùng lại bản `15.0.3` cũ.
