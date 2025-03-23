# Wilderness Haven

Game sinh tồn dạng Tycoon trong thế giới hoang dã đầy quái vật.

## Cách chơi

1. Mở file `index.html` bằng trình duyệt web để bắt đầu chơi.
2. **Thu hoạch tài nguyên**: Click vào cây hoặc đá trên bản đồ để thu thập gỗ và đá.
3. **Xây dựng công trình**:
   - Click vào một loại công trình ở bảng bên phải
   - Chọn vị trí trên bản đồ để xây dựng (các ô màu xanh lá)
   - Mỗi công trình có chi phí và công dụng khác nhau
4. **Nâng cấp công trình**:
   - Click vào công trình đã xây
   - Chọn "Nâng cấp" trong cửa sổ thông tin
   - Nâng cấp sẽ cải thiện hiệu quả của công trình
5. **Thuê nhân vật**:
   - Click vào nút "Thuê nhân vật" ở bảng bên trái
   - Nhân vật sẽ giúp thu thập tài nguyên và bảo vệ khu định cư
   - Bạn cần xây nhà ở để có chỗ cho nhân vật
6. **Đi săn**:
   - Chọn một nhân vật
   - Click vào nút "Đi săn"
   - Chọn một quái vật để săn
   - Nhận phần thưởng khi săn thành công

## Các loại công trình

- **Nhà ở**: Cung cấp chỗ ở cho nhân vật
- **Xưởng chế tạo**: Tăng tốc độ sản xuất và chế tạo trang bị
- **Trạm canh gác**: Bảo vệ khu định cư khỏi quái vật
- **Nông trại**: Sản xuất thức ăn cho khu định cư

## Tài nguyên

- **Gỗ**: Thu được từ việc chặt cây, dùng để xây dựng
- **Đá**: Thu được từ việc đập đá, dùng để xây dựng
- **Thức ăn**: Cần thiết để nuôi nhân vật, thu được từ nông trại và săn bắn
- **Vàng**: Dùng để thuê nhân vật và mua vật phẩm đặc biệt

## Hệ thống hình ảnh

Game sử dụng hai hệ thống hình ảnh:

1. **PixiJS**: Thư viện 2D rendering mạnh mẽ dùng để hiển thị sprite
2. **RPG Awesome**: Thư viện icon dự phòng khi không có hình ảnh

Hình ảnh được tổ chức trong thư mục `assets/sprites/` với các danh mục:

- buildings: Công trình
- characters: Nhân vật
- monsters: Quái vật
- terrain: Địa hình
- icons: Biểu tượng tài nguyên

Xem thêm thông tin chi tiết trong tệp `assets/README.md`.

## Phát triển

Đây là phiên bản demo ban đầu của game, với các tính năng cơ bản. Các tính năng sẽ được bổ sung trong tương lai:

- Hệ thống chiến đấu với quái vật nâng cao
- Nhiều loại công trình và nhân vật hơn
- Chế tạo và nâng cấp trang bị
- Nhiệm vụ phụ và thành tựu
- Sự kiện ngẫu nhiên

## Thông tin kỹ thuật

Game được phát triển với:

- HTML5
- CSS3
- JavaScript thuần
- PixiJS (hiển thị hình ảnh)
- RPG Awesome (icon dự phòng)

## Cài đặt & Phát triển

1. Clone repository này
2. Mở index.html trong trình duyệt web
3. Để thêm hình ảnh mới:
   - Đặt file PNG vào thư mục tương ứng trong `assets/sprites/`
   - Nếu cần, cập nhật cấu hình trong `js/assets.js`

## Credits

- Phát triển bởi: [Tên của bạn]
- Sử dụng thư viện RPG-Awesome để làm icon: [https://nagoshiashumari.github.io/Rpg-Awesome/](https://nagoshiashumari.github.io/Rpg-Awesome/)
