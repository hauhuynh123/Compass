# La Bàn Ảo - Compass Simulation

Một ứng dụng web mô phỏng la bàn với khả năng chỉ hướng đến địa điểm đích được chỉ định.

## Tính năng

- 🧭 **La bàn tương tác**: Mũi tên la bàn sẽ tự động xoay để chỉ hướng đến địa điểm đích
- 📍 **Định vị GPS**: Tự động lấy vị trí hiện tại của bạn
- 🎯 **Tìm kiếm địa điểm**: Nhập tên địa điểm để đặt làm đích đến
- 📊 **Thông tin chi tiết**: Hiển thị hướng (bearing) và khoảng cách đến đích
- 🎨 **Giao diện đẹp**: Thiết kế hiện đại với hiệu ứng mượt mà
- 📱 **Responsive**: Hoạt động tốt trên cả desktop và mobile

## Cách sử dụng

1. **Mở ứng dụng**: Mở file `index.html` trong trình duyệt web
2. **Cho phép định vị**: Khi được yêu cầu, cho phép trình duyệt truy cập vị trí của bạn
3. **Nhập địa điểm đích**: Gõ tên địa điểm bạn muốn đến (VD: "Hà Nội, Việt Nam")
4. **Xem la bàn**: Mũi tên la bàn sẽ tự động xoay để chỉ hướng đến địa điểm đích

## Phím tắt

- `Ctrl/Cmd + L`: Lấy lại vị trí hiện tại
- `Ctrl/Cmd + R`: Reset la bàn
- `Enter`: Đặt địa điểm đích (khi đang nhập trong ô input)

## Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và animations
- **JavaScript ES6+**: Logic ứng dụng
- **Geolocation API**: Lấy vị trí hiện tại
- **Nominatim API**: Tìm kiếm tọa độ địa điểm

## Cấu trúc dự án

```
Compass/
├── index.html          # Trang chính
├── styles.css          # CSS styling
├── script.js           # JavaScript logic
└── README.md           # Hướng dẫn sử dụng
```

## Lưu ý

- Ứng dụng cần kết nối internet để tìm kiếm địa điểm
- Cần cho phép trình duyệt truy cập vị trí để sử dụng đầy đủ tính năng
- Hoạt động tốt nhất trên các trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

## Tính năng nâng cao

- **Touch gestures**: Có thể tương tác với la bàn trên thiết bị cảm ứng
- **Smooth animations**: Hiệu ứng chuyển động mượt mà
- **Error handling**: Xử lý lỗi và thông báo người dùng
- **Loading states**: Hiển thị trạng thái tải
- **Responsive design**: Tự động điều chỉnh theo kích thước màn hình
