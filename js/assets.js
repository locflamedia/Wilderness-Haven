// Quản lý tài nguyên hình ảnh game
const AssetManager = {
  // Đường dẫn đến sprite sheet
  spritesheetPath: "assets/sprites/spritesheet.json",

  // Đường dẫn đến các sprite riêng lẻ
  sprites: {
    buildings: {
      house: "assets/sprites/buildings/house.png",
      workshop: "assets/sprites/buildings/workshop.png",
      guardpost: "assets/sprites/buildings/guardpost.png",
      farm: "assets/sprites/buildings/farm.png",
      castle: "assets/sprites/buildings/castle.png",
      tower: "assets/sprites/buildings/tower.png",
      wall: "assets/sprites/buildings/wall.png",
    },
    terrain: {
      tree: "assets/sprites/terrain/tree.png",
      rock: "assets/sprites/terrain/rock.png",
      grass: "assets/sprites/terrain/grass.png",
    },
    characters: {
      warrior: "assets/sprites/characters/warrior.png",
      archer: "assets/sprites/characters/archer.png",
      mage: "assets/sprites/characters/mage.png",
      knight: "assets/sprites/characters/knight.png",
    },
    monsters: {
      wolf: "assets/sprites/monsters/wolf.png",
      bear: "assets/sprites/monsters/bear.png",
      bandit: "assets/sprites/monsters/bandit.png",
    },
    icons: {
      wood: "assets/sprites/icons/wood.svg",
      stone: "assets/sprites/icons/stone.svg",
      food: "assets/sprites/icons/food.svg",
      gold: "assets/sprites/icons/gold.svg",
      sword: "assets/sprites/icons/sword.svg",
      weapon: "assets/sprites/icons/weapon.svg",
    },
  },

  // Tải hình ảnh mặc định từ RPG-Awesome
  rpgAwesomeIcons: {
    wood: "ra-axe",
    stone: "ra-crystal-ball",
    food: "ra-wheat",
    gold: "ra-gold-bar",
    house: "ra-house",
    workshop: "ra-hammer",
    guardpost: "ra-shield",
    farm: "ra-shovel",
    tree: "ra-pine-tree",
    rock: "ra-stone-block",
    warrior: "ra-knight-helmet",
    archer: "ra-bow-arrow",
    mage: "ra-wizard-staff",
    wolf: "ra-wolf-head",
    bear: "ra-paw",
    bandit: "ra-hood",
    castle: "ra-tower",
    grass: "ra-grass",
    knight: "ra-heavy-shield",
    sword: "ra-sword",
    tower: "ra-tower",
    wall: "ra-block-fortress",
    weapon: "ra-crossed-swords",
  },

  // Tạo sprite từ đường dẫn
  createSprite(type, name) {
    try {
      return PIXI.Sprite.from(this.sprites[type][name]);
    } catch (error) {
      console.warn(
        `Không thể tải sprite ${type}/${name}. Sử dụng icon thay thế.`
      );
      return this.createFallbackSprite(name);
    }
  },

  // Tạo sprite thay thế bằng cách sử dụng màu và văn bản
  createFallbackSprite(name) {
    // Tạo một container PIXI
    const container = new PIXI.Container();

    // Tạo hình nền với màu tương ứng
    const background = new PIXI.Graphics();
    background.beginFill(this.getFallbackColor(name));
    background.drawRect(0, 0, 32, 32);
    background.endFill();
    container.addChild(background);

    // Tạo văn bản hiển thị ký tự đầu tiên của tên
    const text = new PIXI.Text(name.charAt(0).toUpperCase(), {
      fontFamily: "Arial",
      fontSize: 20,
      fill: "white",
    });
    text.anchor.set(0.5);
    text.position.set(16, 16);
    container.addChild(text);

    return container;
  },

  // Lấy màu thay thế cho từng loại sprite
  getFallbackColor(name) {
    const colors = {
      house: 0x8b4513,
      workshop: 0x696969,
      guardpost: 0xb22222,
      farm: 0xdaa520,
      tree: 0x228b22,
      rock: 0x708090,
      warrior: 0x8b0000,
      archer: 0x006400,
      mage: 0x00008b,
      wolf: 0x808080,
      bear: 0x8b4513,
      bandit: 0x2f4f4f,
      wood: 0x8b4513,
      stone: 0x708090,
      food: 0xdaa520,
      gold: 0xffd700,
      castle: 0x4b0082,
      grass: 0x7cfc00,
      knight: 0xcd5c5c,
      sword: 0xc0c0c0,
      tower: 0x8b008b,
      wall: 0x808080,
      weapon: 0xa52a2a,
    };

    return colors[name] || 0x333333;
  },

  // Khởi tạo tải RPG Awesome
  init() {
    // Thêm CSS RPG Awesome
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://nagoshiashumari.github.io/Rpg-Awesome/stylesheets/rpg-awesome.min.css";
    document.head.appendChild(link);

    // Khởi tạo PIXI nếu cần
    if (typeof PIXI === "undefined") {
      console.error(
        "PIXI.js không được tải! Hãy đảm bảo rằng thư viện PixiJS đã được thêm vào trang."
      );
    } else {
      console.log("AssetManager đã khởi tạo với PIXI.js", PIXI.VERSION);
    }
  },

  // Render icon RPG Awesome vào một element
  renderRpgIcon(element, type, name) {
    if (element) {
      const iconClass = this.rpgAwesomeIcons[name] || "ra-eye";
      element.innerHTML = `<i class="ra ${iconClass}"></i>`;
    }
  },

  // Tải sprite vào một element
  loadSpriteToElement(element, type, name) {
    if (!element) return;

    // Thử tải sprite từ đường dẫn
    const img = new Image();
    img.src = this.sprites[type][name];
    img.onload = () => {
      element.style.backgroundImage = `url(${img.src})`;
      element.style.backgroundColor = "transparent";
    };
    img.onerror = () => {
      // Nếu lỗi, sử dụng RPG Awesome thay thế
      this.renderRpgIcon(element, type, name);
    };
  },
};

// Khởi tạo AssetManager khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  AssetManager.init();
});
