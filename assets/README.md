# Hướng dẫn sử dụng hình ảnh cho Wilderness Haven

## Cấu trúc thư mục

Thư mục `assets` chứa tất cả tài nguyên hình ảnh cho game, được tổ chức như sau:

```
assets/
  ├── sprites/
  │   ├── buildings/     # Hình ảnh các công trình
  │   ├── characters/    # Hình ảnh nhân vật
  │   ├── monsters/      # Hình ảnh quái vật
  │   ├── terrain/       # Hình ảnh địa hình
  │   └── icons/         # Biểu tượng tài nguyên
```

## Quy ước đặt tên

Tất cả tệp hình ảnh nên tuân theo quy ước đặt tên sau:

- Chỉ sử dụng chữ thường và dấu gạch ngang (-)
- Tên tệp nên khớp với tên được sử dụng trong mã JavaScript
- Ví dụ: `wolf.png`, `pine-tree.png`, `stone-wall.png`

## Định dạng hình ảnh

- Sử dụng định dạng PNG với nền trong suốt
- Kích thước đề xuất:
  - Công trình: 64x64 pixels
  - Nhân vật: 32x32 pixels
  - Quái vật: 32x32 pixels
  - Địa hình: 32x32 pixels
  - Biểu tượng: 24x24 pixels
- Phong cách pixel art hoặc tối giản phù hợp với chủ đề game

## Thêm hình ảnh mới

1. Đặt tệp hình ảnh vào thư mục tương ứng
2. Cập nhật đường dẫn trong `js/assets.js` nếu cần
3. Hình ảnh sẽ tự động được tải và sử dụng thông qua AssetManager

## Hình ảnh dự phòng

Nếu hình ảnh không tồn tại hoặc không thể tải được, game sẽ sử dụng:

1. Icon từ thư viện RPG Awesome (https://nagoshiashumari.github.io/Rpg-Awesome/)
2. Hoặc một ô màu đơn giản với chữ cái đầu tiên của đối tượng

## Nguồn hình ảnh miễn phí

Dưới đây là một số nguồn hình ảnh miễn phí bạn có thể sử dụng cho game:

- [Kenney Game Assets](https://kenney.nl/assets) - Bộ sưu tập lớn các tài nguyên game miễn phí
- [OpenGameArt.org](https://opengameart.org) - Kho tài nguyên game mã nguồn mở
- [Game-icons.net](https://game-icons.net) - Bộ sưu tập biểu tượng game
- [itch.io](https://itch.io/game-assets/free) - Nhiều tài nguyên game miễn phí và trả phí
- [Craftpix.net](https://craftpix.net/freebies/) - Tài nguyên game miễn phí chất lượng cao

## Lưu ý

- Đảm bảo bạn có quyền sử dụng bất kỳ hình ảnh nào thêm vào game
- Luôn kiểm tra giấy phép của tài nguyên trước khi sử dụng
- Nếu có thể, hãy ghi nhận tác giả trong phần Credits của game
