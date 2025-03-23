// Khởi tạo các biến toàn cục
const gameState = {
  resources: {
    wood: 10,
    stone: 5,
    food: 15,
    gold: 0,
  },
  characters: [],
  buildings: [],
  monsters: [],
  huntingGroups: [],
  selectedBuilding: null,
  selectedCharacter: null,
  buildMode: false,
  currentBuildingType: null,
  grid: {
    rows: 25,
    cols: 25,
  },
  gameStarted: false, // Biến kiểm tra game đã bắt đầu chưa
  progression: {
    // Theo dõi tiến trình người chơi
    tutorial: {
      welcomeShown: false,
      resourcesIntroduced: false,
      buildingIntroduced: false,
      characterIntroduced: false,
      huntingIntroduced: false,
    },
    quests: {
      buildFirstHouse: false,
      collectResources: false,
      hireFirstCharacter: false,
      goHunting: false,
    },
    // Số lượng đã thu thập cho nhiệm vụ
    collectedResources: {
      wood: 0,
      stone: 0,
      food: 0,
      gold: 0,
    },
  },
  tutorialStep: 0,
  lastSaveTime: null, // Thời gian lưu cuối cùng
  mapControls: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
  }, // Thêm điều khiển bản đồ
};

// Khởi tạo biểu tượng tài nguyên cho game
function initResourceIcons() {
  // Lấy các phần tử­ chứa biểu tượng tài nguyên
  const woodIcon = document.querySelector(".wood-icon");
  const stoneIcon = document.querySelector(".stone-icon");
  const foodIcon = document.querySelector(".food-icon");
  const goldIcon = document.querySelector(".gold-icon");

  // Tải biểu tượng sử­ dụng AssetManager
  if (woodIcon) AssetManager.loadSpriteToElement(woodIcon, "icons", "wood");
  if (stoneIcon) AssetManager.loadSpriteToElement(stoneIcon, "icons", "stone");
  if (foodIcon) AssetManager.loadSpriteToElement(foodIcon, "icons", "food");
  if (goldIcon) AssetManager.loadSpriteToElement(goldIcon, "icons", "gold");
}

// Hàm khởi tạo game
function initGame() {
  // Tạo màn hình bắt đầu
  createStartScreen();

  // Thiết lập các thành phần game nhưng chưa hiển thị
  createGrid();
  initResourceIcons();
  updateResourceDisplay();
  addEventListeners();

  // Khởi tạo chức năng đóng modal
  initModalClosing();

  // Ẩn giao diện game cho đến khi người chơi bắt đầu
  document.querySelector(".game-area").style.display = "none";
  document.querySelector(".resource-panel").style.display = "none";
  document.querySelector(".notification-panel").style.display = "none";
}

// Tạo màn hình bắt đầu game
function createStartScreen() {
  const startScreen = document.createElement("div");
  startScreen.className = "start-screen";
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>Wilderness Haven</h1>
      <p>Game sinh tồn trong thế giới hoang dã đầy quái vật</p>
      <button id="start-game-button">Bắt Đầu Cuộc Phiêu Lưu</button>
      <button id="load-game-button" style="display: none;">Tiếp Tục Chơi</button>
      <div class="instructions">
        <h3>Hướng dẫn cơ bản:</h3>
        <ul>
          <li>Thu hoạch tài nguyên bằng cách nhấp vào cây và đá</li>
          <li>Xây dựng công trình từ bảng bên phải</li>
          <li>Thuê nhân vật để bảo vệ khu định cư</li>
          <li>Đi săn quái vật để kiếm tài nguyên</li>
        </ul>
      </div>
    </div>
  `;

  document.querySelector(".game-container").prepend(startScreen);

  // Thêm sự kiện bắt đầu game
  document
    .getElementById("start-game-button")
    .addEventListener("click", startGame);

  // Kiểm tra xem có dữ liệu đã lưu không
  checkSavedGame();
}

// Kiểm tra dữ liệu đã lưu
function checkSavedGame() {
  const savedGame = localStorage.getItem("wildernessHavenSave");

  if (savedGame) {
    try {
      const saveData = JSON.parse(savedGame);
      const saveDate = new Date(saveData.lastSaveTime);
      const formattedDate = saveDate.toLocaleString();

      // Hiển thị nút tải game và cập nhật thông tin
      const loadButton = document.getElementById("load-game-button");
      loadButton.style.display = "block";
      loadButton.textContent = `Tiếp Tục Chơi (Đã lưu: ${formattedDate})`;
      loadButton.addEventListener("click", loadGame);
    } catch (error) {
      console.error("Không thể đọc dữ liệu đã lưu:", error);
    }
  }
}

// Bắt đầu game
function startGame() {
  // Đánh dấu game đã bắt đầu
  gameState.gameStarted = true;

  // Ẩn màn hình bắt đầu
  const startScreen = document.querySelector(".start-screen");
  if (startScreen) {
    startScreen.style.display = "none";
  }

  // Hiển thị giao diện game
  document.querySelector(".game-area").style.display = "flex";
  document.querySelector(".resource-panel").style.display = "flex";
  document.querySelector(".notification-panel").style.display = "flex";

  // Tạo địa hình và khu vực săn bắn
  generateTerrain();
  createHuntingGrounds();

  // Đảm bảo điều khiển bản đồ được thêm vào
  addMapControls();

  // Cập nhật hiển thị bản đồ với các giá trị mặc định
  gameState.mapControls = {
    zoom: 0.4,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
  };
  updateMapDisplay();

  // Thêm thông báo
  addNotification(
    "Chào mừng đến với Wilderness Haven! Hãy bắt đầu xây dựng khu định cư của bạn."
  );

  // Bắt đầu hướng dẫn
  startTutorial();

  // Bắt đầu tự động lưu
  startAutoSave();
}

// Tạo grid cho bản đồ
function createGrid() {
  const gridContainer = document.getElementById("grid-container");
  gridContainer.innerHTML = "";

  for (let row = 0; row < gameState.grid.rows; row++) {
    for (let col = 0; col < gameState.grid.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      gridContainer.appendChild(cell);
    }
  }

  // Thêm điều khiển bản đồ
  addMapControls();
}

// Thêm điều khiển bản đồ
function addMapControls() {
  const settlementMap = document.querySelector(".settlement-map");
  const gridContainer = document.getElementById("grid-container");

  // Xóa nút điều khiển cũ nếu có
  const oldControls = document.querySelector(".map-controls");
  if (oldControls) {
    oldControls.remove();
  }

  // Tạo khung điều khiển bản đồ
  const mapControls = document.createElement("div");
  mapControls.className = "map-controls";
  mapControls.innerHTML = `
    <div class="map-control zoom-in" title="Phóng to">+</div>
    <div class="map-control move-up" title="Di chuyển lên">↑</div>
    <div class="map-control zoom-out" title="Thu nhỏ">-</div>
    <div class="map-control move-left" title="Di chuyển trái">←</div>
    <div class="map-control center-map" title="Về giữa">■</div>
    <div class="map-control move-right" title="Di chuyển phải">→</div>
    <div class="map-control full-map" title="Xem toàn bộ bản đồ">⛶</div>
    <div class="map-control move-down" title="Di chuyển xuống">↓</div>
    <div class="map-control reset-zoom" title="Đặt lại tỷ lệ">♻</div>
  `;

  settlementMap.appendChild(mapControls);

  // Thêm sự kiện cho các nút điều khiển
  mapControls
    .querySelector(".zoom-in")
    .addEventListener("click", () => zoomMap(0.2));
  mapControls
    .querySelector(".zoom-out")
    .addEventListener("click", () => zoomMap(-0.2));
  mapControls
    .querySelector(".move-up")
    .addEventListener("click", () => moveMap(0, 50));
  mapControls
    .querySelector(".move-down")
    .addEventListener("click", () => moveMap(0, -50));
  mapControls
    .querySelector(".move-left")
    .addEventListener("click", () => moveMap(50, 0));
  mapControls
    .querySelector(".move-right")
    .addEventListener("click", () => moveMap(-50, 0));
  mapControls.querySelector(".center-map").addEventListener("click", centerMap);
  mapControls.querySelector(".reset-zoom").addEventListener("click", resetZoom);
  mapControls.querySelector(".full-map").addEventListener("click", showFullMap);

  // Thêm sự kiện kéo bản đồ
  gridContainer.addEventListener("mousedown", startDragMap);
  gridContainer.addEventListener("touchstart", startDragMap, {
    passive: false,
  });

  document.addEventListener("mousemove", dragMap);
  document.addEventListener("touchmove", dragMap, { passive: false });

  document.addEventListener("mouseup", stopDragMap);
  document.addEventListener("touchend", stopDragMap);

  // Thêm sự kiện cuộn chuột để zoom
  gridContainer.addEventListener("wheel", handleMapWheel);

  // Cập nhật hiển thị ban đầu
  updateMapDisplay();
}

// Bắt đầu kéo bản đồ
function startDragMap(event) {
  // Chỉ cho phép kéo khi không ở chế độ xây dựng
  if (gameState.buildMode) return;

  event.preventDefault(); // Ngăn các hành vi mặc định

  // Xử­ lý cả chuột và cảm ứng
  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);

  if (clientX && clientY) {
    gameState.mapControls.isDragging = true;
    gameState.mapControls.dragStartX = clientX - gameState.mapControls.offsetX;
    gameState.mapControls.dragStartY = clientY - gameState.mapControls.offsetY;
  }
}

// Kéo bản đồ
function dragMap(event) {
  if (!gameState.mapControls.isDragging) return;

  event.preventDefault(); // Ngăn các hành vi mặc định

  // Xử­ lý cả chuột và cảm ứng
  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);

  if (clientX && clientY) {
    gameState.mapControls.offsetX = clientX - gameState.mapControls.dragStartX;
    gameState.mapControls.offsetY = clientY - gameState.mapControls.dragStartY;

    updateMapDisplay();
  }
}

// Dừng kéo bản đồ
function stopDragMap() {
  gameState.mapControls.isDragging = false;
}

// Xử­ lý cuộn chuột trên bản đồ
function handleMapWheel(event) {
  event.preventDefault();

  // Điều chỉnh tỷ lệ zoom dựa trên hướng cuộn
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  zoomMap(delta);
}

// Zoom bản đồ
function zoomMap(delta) {
  const newZoom = gameState.mapControls.zoom + delta;

  // Giới hạn zoom trong khoảng từ 0.3 đến 1.5 (giảm minimum zoom để thấy được nhiều hơn)
  if (newZoom >= 0.3 && newZoom <= 1.5) {
    gameState.mapControls.zoom = newZoom;

    // Kiểm tra nếu zoom quá lớn có thể gây vử¡ layout, giới hạn lại offset
    if (newZoom > 1) {
      // Giới hạn offsetX vàoffsetY để không vượt quá kí­ch thước của settlement-map
      const maxOffset = 50 * newZoom;
      gameState.mapControls.offsetX = Math.max(
        -maxOffset,
        Math.min(maxOffset, gameState.mapControls.offsetX)
      );
      gameState.mapControls.offsetY = Math.max(
        -maxOffset,
        Math.min(maxOffset, gameState.mapControls.offsetY)
      );
    }

    updateMapDisplay();
  }
}

// Di chuyển bản đồ
function moveMap(deltaX, deltaY) {
  // Tí­nh toán vị trí mới
  const newOffsetX = gameState.mapControls.offsetX + deltaX;
  const newOffsetY = gameState.mapControls.offsetY + deltaY;

  // Giới hạn phạm vi di chuyển dựa trên mức zoom hiện tại
  const maxOffset = 100 * gameState.mapControls.zoom;

  // Áp dụng giới hạn
  gameState.mapControls.offsetX = Math.max(
    -maxOffset,
    Math.min(maxOffset, newOffsetX)
  );
  gameState.mapControls.offsetY = Math.max(
    -maxOffset,
    Math.min(maxOffset, newOffsetY)
  );

  updateMapDisplay();
}

// Về giữa bản đồ
function centerMap() {
  gameState.mapControls.offsetX = 0;
  gameState.mapControls.offsetY = 0;
  updateMapDisplay();
}

// Đặt lại tỷ lệ zoom
function resetZoom() {
  gameState.mapControls.zoom = 1;
  updateMapDisplay();
}

// Hiển thị toàn bộ bản đồ với mức zoom phù hợp
function showFullMap() {
  // Tí­nh toán mức zoom cần thiết để hiển thị toàn bộ bản đồ
  // Mức zoom thấp hơn (0.3-0.4) cho bản đồ lớn
  gameState.mapControls.zoom = 0.35;
  gameState.mapControls.offsetX = 0;
  gameState.mapControls.offsetY = 0;
  updateMapDisplay();

  addNotification("Đang hiển thị toàn bộ bản đồ");
}

// Cập nhật hiển thị bản đồ
function updateMapDisplay() {
  const gridContainer = document.getElementById("grid-container");

  // Kiểm tra xem gameState.mapControls đã được khởi tạo chưa
  if (!gameState.mapControls) {
    gameState.mapControls = {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
    };
  }

  // Cập nhật tỷ lệ và vị trí­
  gridContainer.style.transform = `scale(${gameState.mapControls.zoom}) translate(${gameState.mapControls.offsetX}px, ${gameState.mapControls.offsetY}px)`;
  gridContainer.style.transformOrigin = "center";

  // Cập nhật kí­ch thước ô grid
  const cellSize = 40 * gameState.mapControls.zoom; // Kí­ch thước cơ bản 40px
  document.documentElement.style.setProperty("--cell-size", `${cellSize}px`);
}

// Tạo địa hình ngẫu nhiên
function generateTerrain() {
  // Tạo cây cối và đá
  for (let i = 0; i < 50; i++) {
    const row = Math.floor(Math.random() * gameState.grid.rows);
    const col = Math.floor(Math.random() * gameState.grid.cols);
    const cell = document.querySelector(
      `.grid-cell[data-row="${row}"][data-col="${col}"]`
    );

    // Kiểm tra xem ô đã có gì chưa
    if (!cell.hasChildNodes()) {
      const terrainType = Math.random() > 0.5 ? "tree" : "rock";
      const terrain = document.createElement("div");
      terrain.className = terrainType;
      terrain.dataset.type = terrainType;

      // Sử­ dụng AssetManager để tải hình ảnh
      AssetManager.loadSpriteToElement(terrain, "terrain", terrainType);

      cell.appendChild(terrain);
      cell.dataset.terrain = terrainType;
    }
  }
}

// Tạo khu vực săn bắn
function createHuntingGrounds() {
  // Tạo các loại quái vật cơ bản
  const monsterTypes = [
    {
      type: "wolf",
      name: "Sói",
      health: 20,
      damage: 5,
      loot: { gold: 2, food: 1 },
      difficulty: 1,
    },
    {
      type: "bear",
      name: "Gấu",
      health: 40,
      damage: 8,
      loot: { gold: 4, food: 3 },
      difficulty: 2,
    },
    {
      type: "bandit",
      name: "Káº» cướp",
      health: 15,
      damage: 4,
      loot: { gold: 6, stone: 1 },
      difficulty: 1,
    },
  ];

  // Tạo quái vật ngẫu nhiên
  for (let i = 0; i < 20; i++) {
    const monsterTemplate =
      monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const monster = {
      id: `monster-${i}`,
      type: monsterTemplate.type,
      name: monsterTemplate.name,
      health: monsterTemplate.health,
      damage: monsterTemplate.damage,
      loot: { ...monsterTemplate.loot },
      difficulty: monsterTemplate.difficulty,
    };
    gameState.monsters.push(monster);
  }
}

// Xử­ lý khi click vào một ô trên bản đồ
function handleCellClick(event) {
  const cell = event.currentTarget;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  // Nếu đang ở chế độ xây dựng
  if (gameState.buildMode && gameState.currentBuildingType) {
    buildStructure(row, col, gameState.currentBuildingType);
  }
  // Nếu click vào một công trình đã xây
  else if (cell.querySelector(".building")) {
    selectBuilding(cell);
  }
  // Nếu click vào địa hình (cây, đá)
  else if (cell.dataset.terrain) {
    harvestResource(cell);
  }
}

// Xây dựng một công trình
function buildStructure(row, col, buildingType) {
  const cell = document.querySelector(
    `.grid-cell[data-row="${row}"][data-col="${col}"]`
  );

  // Kiểm tra xem ô này có thể xây được không
  if (cell.hasChildNodes() || cell.dataset.terrain) {
    addNotification("Không thể xây dựng ở đây. Hãy dọn sạch địa hình trước.");
    return;
  }

  // Kiểm tra xem có đủ tài nguyên không
  const buildingCosts = {
    house: { wood: 5, stone: 2 },
    workshop: { wood: 8, stone: 4 },
    guardpost: { wood: 6, stone: 3 },
    farm: { wood: 4, stone: 1 },
  };

  const cost = buildingCosts[buildingType];
  if (
    gameState.resources.wood < cost.wood ||
    gameState.resources.stone < cost.stone
  ) {
    addNotification("Không đủ tài nguyên để xây dựng. Cần thêm tài nguyên.");
    return;
  }

  // Trừ tài nguyên
  gameState.resources.wood -= cost.wood;
  gameState.resources.stone -= cost.stone;
  updateResourceDisplay();

  // Tạo công trình
  const building = document.createElement("div");
  building.className = "building " + buildingType;
  building.dataset.type = buildingType;
  building.dataset.level = "1";

  // Sử­ dụng AssetManager để tải hình ảnh công trình
  AssetManager.loadSpriteToElement(building, "buildings", buildingType);

  // Thêm chỉ số cấp độ
  const levelIndicator = document.createElement("div");
  levelIndicator.className = "building-level";
  levelIndicator.textContent = "Lv.1";
  building.appendChild(levelIndicator);

  cell.appendChild(building);

  // Thêm công trình vào danh sách
  gameState.buildings.push({
    type: buildingType,
    row: row,
    col: col,
    level: 1,
  });

  // Tắt chế độ xây dựng sau khi đã xây
  gameState.buildMode = false;
  gameState.currentBuildingType = null;
  resetBuildingOptions();

  addNotification(`Đã xây dựng ${getBuildingName(buildingType)} thành công!`);

  // Kiểm tra nhiệm vụ
  if (
    buildingType === "house" &&
    gameState.buildings.filter((b) => b.type === "house").length === 1
  ) {
    completeQuest("Xây dựng nhà ở đầu tiên");
  }
}

// Chọn một công trình
function selectBuilding(cell) {
  // Xóa lựa chọn trước đó
  document.querySelectorAll(".grid-cell.selected").forEach((cell) => {
    cell.classList.remove("selected");
  });

  // Thêm lựa chọn mới
  cell.classList.add("selected");

  const building = cell.querySelector(".building");
  const buildingType = building.dataset.type;
  const buildingLevel = building.dataset.level;

  // Lưu công trình đang chọn
  gameState.selectedBuilding = {
    element: building,
    type: buildingType,
    level: parseInt(buildingLevel),
    row: parseInt(cell.dataset.row),
    col: parseInt(cell.dataset.col),
  };

  // Hiển thị thông tin công trình
  showBuildingInfo(buildingType, parseInt(buildingLevel));
}

// Hiển thị thông tin công trình
function showBuildingInfo(type, level) {
  const modal = document.getElementById("building-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  const actionButton = document.getElementById("modal-action-button");
  const cancelButton = document.getElementById("modal-cancel-button");

  modalTitle.textContent = getBuildingName(type) + " - Cấp " + level;

  // Tạo nội dung
  let content = "";
  switch (type) {
    case "house":
      content = `
                <p>Cung cấp chỗ ở cho ${level + 1} nhân vật.</p>
                <p>Sản xuất 1 đơn vị thức ăn mỗi ${11 - level} giây.</p>
            `;
      break;
    case "workshop":
      content = `
                <p>Chế tạo vật phẩm và trang bị.</p>
                <p>Tốc độ sản xuất: ${level * 10}%</p>
                <p>Sản xuất 1 đơn vị gỗ mỗi ${11 - level} giây.</p>
            `;
      break;
    case "guardpost":
      content = `
                <p>Bảo vệ khu định cư khỏi quái vật.</p>
                <p>Phòng thủ: ${level * 5}</p>
                <p>Phạm vi: ${level + 2} ô</p>
            `;
      break;
    case "farm":
      content = `
                <p>Sản xuất thức ăn cho khu định cư.</p>
                <p>Sản xuất ${level + 1} đơn vị thức ăn mỗi 10 giây.</p>
            `;
      break;
  }

  modalContent.innerHTML = content;

  // Cập nhật nút hành động
  actionButton.textContent = "Nâng cấp";
  actionButton.onclick = upgradeBuilding;

  // Cập nhật nút hủy
  cancelButton.textContent = "Đóng";
  cancelButton.onclick = () => {
    modal.style.display = "none";
  };

  // Đảm bảo nút đóng dấu X cũng hoạt động
  const closeButton = modal.querySelector(".close-button");
  if (closeButton) {
    closeButton.onclick = () => {
      modal.style.display = "none";
    };
  }

  // Hiển thị modal
  modal.style.display = "block";
}

// Nâng cấp công trình
function upgradeBuilding() {
  if (!gameState.selectedBuilding) return;

  const building = gameState.selectedBuilding;
  const upgradeLevel = building.level + 1;

  if (upgradeLevel > 5) {
    addNotification("Công trình đã đạt cấp độ tối đa!");
    return;
  }

  // Chi phí­ nâng cấp
  const baseCost = {
    house: { wood: 3, stone: 2 },
    workshop: { wood: 5, stone: 3 },
    guardpost: { wood: 4, stone: 2 },
    farm: { wood: 3, stone: 1 },
  };

  const cost = {
    wood: baseCost[building.type].wood * upgradeLevel,
    stone: baseCost[building.type].stone * upgradeLevel,
  };

  // Kiểm tra tài nguyên
  if (
    gameState.resources.wood < cost.wood ||
    gameState.resources.stone < cost.stone
  ) {
    addNotification("Không đủ tài nguyên để nâng cấp. Cần thêm tài nguyên.");
    return;
  }

  // Trừ tài nguyên
  gameState.resources.wood -= cost.wood;
  gameState.resources.stone -= cost.stone;
  updateResourceDisplay();

  // Cập nhật cấp độ
  building.element.dataset.level = upgradeLevel;
  building.level = upgradeLevel;
  building.element.querySelector(".building-level").textContent =
    "Lv." + upgradeLevel;

  // Cập nhật dữ liệu
  const buildingIndex = gameState.buildings.findIndex(
    (b) => b.row === building.row && b.col === building.col
  );
  gameState.buildings[buildingIndex].level = upgradeLevel;

  // Cập nhật thông tin công trình
  showBuildingInfo(building.type, upgradeLevel);

  addNotification(
    `Đã nâng cấp ${getBuildingName(building.type)} lên cấp ${upgradeLevel}!`
  );
}

// Trả về tên tiếng Việt của loại tài nguyên
function getResourceName(resourceType) {
  const resourceNames = {
    wood: "gỗ",
    stone: "đá",
    food: "thức ăn",
    gold: "vàng",
  };
  return resourceNames[resourceType] || resourceType;
}

// Trả về tên tiếng Việt của loại công trình
function getBuildingName(buildingType) {
  const buildingNames = {
    house: "Nhà ở",
    workshop: "Xưởng chế tạo",
    guardpost: "Trạm canh gác",
    farm: "Nông trại",
  };
  return buildingNames[buildingType] || buildingType;
}

// Thu hoạch tài nguyên từ địa hình
function harvestResource(cell) {
  const terrainType = cell.dataset.terrain;
  const terrain = cell.querySelector("." + terrainType);

  if (!terrain) return;

  let resourceGain = 0;
  let resourceType = "";

  // Xác định loại tài nguyên
  if (terrainType === "tree") {
    resourceGain = Math.floor(Math.random() * 2) + 1; // 1-2 gỗ
    resourceType = "wood";
  } else if (terrainType === "rock") {
    resourceGain = Math.floor(Math.random() * 1) + 1; // 1 đá
    resourceType = "stone";
  }

  // Thêm tài nguyên vào kho
  gameState.resources[resourceType] += resourceGain;

  // Đếm tài nguyên đã thu thập cho nhiệm vụ
  gameState.progression.collectedResources[resourceType] += resourceGain;

  // Hiển thị thông báo
  addNotification(
    `Thu được ${resourceGain} ${getResourceName(resourceType)} từ ${
      terrainType === "tree" ? "cây" : "đá"
    }.`
  );

  // Cập nhật hiển thị tài nguyên
  updateResourceDisplay();

  // Xóa địa hình sau khi thu hoạch
  cell.removeChild(terrain);
  delete cell.dataset.terrain;

  // Cập nhật tiến trình
  checkProgressionUpdates();
}

// Thêm thông báo mới
function addNotification(message) {
  const notifications = document.getElementById("notifications");
  const notification = document.createElement("p");
  notification.className = "notification new";
  notification.textContent = message;

  notifications.insertBefore(notification, notifications.firstChild);

  // Xóa class 'new' sau 3 giây
  setTimeout(() => {
    notification.classList.remove("new");
  }, 3000);

  // Giới hạn số lượng thông báo
  if (notifications.children.length > 5) {
    notifications.removeChild(notifications.lastChild);
  }
}

// Cập nhật hàm completeQuest
function completeQuest(questText) {
  // Tìm nhiệm vụ trong danh sách
  const questList = document.getElementById("quest-log").querySelector("ul");
  const quests = questList.querySelectorAll("li");

  for (const quest of quests) {
    if (
      quest.textContent === questText &&
      !quest.classList.contains("quest-completed")
    ) {
      // Đánh dấu nhiệm vụ đã hoàn thành
      quest.classList.add("quest-completed");

      // Hiển thị thông báo
      addNotification(`Đã hoàn thành nhiệm vụ: ${questText}!`);

      // Thêm hiệu ứng pháo hoa mini
      showCompletionEffect();

      // Thưởng tài nguyên cho người chơi
      giveQuestReward(questText);

      // Thêm nhiệm vụ mới nếu cần
      addNextQuest(questText);

      break;
    }
  }
}

// Hiển thị hiệu ứng khi hoàn thành nhiệm vụ
function showCompletionEffect() {
  // Tạo container cho hiệu ứng
  const effectContainer = document.createElement("div");
  effectContainer.className = "completion-effect";
  document.body.appendChild(effectContainer);

  // Tạo các hạt pháo hoa
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "completion-particle";

    // Màu ngẫu nhiên
    const colors = ["#ffd700", "#ff9900", "#ff5500", "#66ff66", "#5588ff"];
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Vị trí và chuyển động ngẫu nhiên
    const x = 50 + (Math.random() - 0.5) * 30;
    const y = 50 + (Math.random() - 0.5) * 30;
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 80;

    particle.style.left = x + "%";
    particle.style.top = y + "%";

    // Thêm animation cho hạt
    particle.style.transform = `translate(0, 0)`;
    particle.style.opacity = 1;

    setTimeout(() => {
      particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${
        Math.sin(angle) * distance
      }px)`;
      particle.style.opacity = 0;
    }, 10);

    effectContainer.appendChild(particle);
  }

  // Xóa hiệu ứng sau khi hoàn thành
  setTimeout(() => {
    effectContainer.remove();
  }, 2000);
}

// Thưởng tài nguyên cho người chơi dựa trên nhiệm vụ hoàn thành
function giveQuestReward(questText) {
  let reward = {};

  switch (questText) {
    case "Xây dựng nhà ở đầu tiên":
      reward = { gold: 5, food: 5 };
      break;
    case "Thu thập 10 gỗ":
      reward = { stone: 5, gold: 2 };
      break;
    case "Thuê nhân vật đầu tiên":
      reward = { wood: 5, stone: 3, food: 5 };
      break;
    case "Gửi nhân vật đi săn":
      reward = { gold: 10, food: 8 };
      break;
    default:
      reward = { gold: 2 };
  }

  // Thêm tài nguyên vào kho
  for (const resource in reward) {
    gameState.resources[resource] += reward[resource];
  }

  // Cập nhật hiển thị
  updateResourceDisplay();

  // Hiển thị thông báo
  let rewardText = "Phần thưởng: ";
  for (const resource in reward) {
    rewardText += `${reward[resource]} ${getResourceName(resource)}, `;
  }
  rewardText = rewardText.slice(0, -2); // Xóa dấu phẩy và khoảng trắng ở cuối

  addNotification(rewardText);
}

// Thêm nhiệm vụ mới sau khi hoàn thành nhiệm vụ
function addNextQuest(completedQuest) {
  const questList = document.getElementById("quest-log").querySelector("ul");

  switch (completedQuest) {
    case "Xây dựng nhà ở đầu tiên":
      // Nếu đã hoàn thành tất cả nhiệm vụ khác, thêm nhiệm vụ mới
      if (document.querySelectorAll(".quest-completed").length >= 4) {
        addQuestToList("Xây dựng 3 công trình khác nhau");
      }
      break;
    case "Thu thập 10 gỗ":
      // Nếu đã hoàn thành tất cả nhiệm vụ khác, thêm nhiệm vụ mới
      if (document.querySelectorAll(".quest-completed").length >= 4) {
        addQuestToList("Thu thập 15 đá");
      }
      break;
    case "Thuê nhân vật đầu tiên":
      // Nếu đã hoàn thành tất cả nhiệm vụ khác, thêm nhiệm vụ mới
      if (document.querySelectorAll(".quest-completed").length >= 4) {
        addQuestToList("Thuê thêm 2 nhân vật");
      }
      break;
    case "Gửi nhân vật đi săn":
      // Nếu đã hoàn thành tất cả nhiệm vụ khác, thêm nhiệm vụ mới
      if (document.querySelectorAll(".quest-completed").length >= 4) {
        addQuestToList("Săn 3 con quái vật");
      }
      break;
  }
}

// Thêm nhiệm vụ vào danh sách
function addQuestToList(questText) {
  const questList = document.getElementById("quest-log").querySelector("ul");
  const questItem = document.createElement("li");
  questItem.textContent = questText;
  questItem.classList.add("new-quest");

  // Thêm hiệu ứng highlight cho nhiệm vụ mới
  setTimeout(() => {
    questItem.classList.add("highlight");
    setTimeout(() => {
      questItem.classList.remove("highlight");
      questItem.classList.remove("new-quest");
    }, 3000);
  }, 100);

  questList.appendChild(questItem);

  // Thông báo
  addNotification(`Nhiệm vụ mới: ${questText}`);
}

// Cập nhật hiển thị tài nguyên
function updateResourceDisplay() {
  for (const resource in gameState.resources) {
    document.querySelector(`#${resource} .resource-count`).textContent =
      gameState.resources[resource];
  }
}

// Thêm sự kiện cho các phần tử­
function addEventListeners() {
  // Xử­ lý các nút xây dựng
  const buildingOptions = document.querySelectorAll(".building-option");
  buildingOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const buildingType = option.dataset.building;
      startBuildMode(buildingType);
    });
  });

  // Nút thuê nhân vật
  const hireButton = document.getElementById("hire-button");
  hireButton.addEventListener("click", () => {
    hireCharacter();
  });

  // Nút săn bắn
  const huntButton = document.getElementById("hunt-button");
  huntButton.addEventListener("click", () => {
    showHuntingModal();
  });

  // Đóng modal săn bắn
  const huntingCloseButton = document.getElementById("hunting-close-button");
  if (huntingCloseButton) {
    huntingCloseButton.addEventListener("click", () => {
      document.getElementById("hunting-modal").style.display = "none";
    });
  }

  // Đóng tất cả các modal khi click vào nút đóng
  const closeButtons = document.querySelectorAll(".close-button");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        modal.style.display = "none";
      });
    });
  });

  // Thêm sự kiện cho phí­m ESC để hủy chế độ xây dựng
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      // Hủy chế độ xây dựng
      if (gameState.buildMode) {
        gameState.buildMode = false;
        gameState.currentBuildingType = null;
        resetBuildingOptions();
        addNotification("Đã hủy chế độ xây dựng.");
      }

      // Đóng tất cả các modal đang mở
      document.querySelectorAll(".modal").forEach((modal) => {
        if (modal.style.display === "block") {
          modal.style.display = "none";
        }
      });
    }
  });

  // Thêm sự kiện click chuột phải để hủy chế độ xây dựng
  document.addEventListener("contextmenu", (event) => {
    if (gameState.buildMode) {
      event.preventDefault();
      gameState.buildMode = false;
      gameState.currentBuildingType = null;
      resetBuildingOptions();
      addNotification("Đã hủy chế độ xây dựng.");
    }
  });
}

// Bắt đầu chế độ xây dựng
function startBuildMode(buildingType) {
  // Reset trạng thái
  resetBuildingOptions();

  // Set trạng thái xây dựng
  gameState.buildMode = true;
  gameState.currentBuildingType = buildingType;

  // Đánh dấu lựa chọn đang hoạt động
  document
    .querySelector(`.building-option[data-building="${buildingType}"]`)
    .classList.add("active-option");

  // Đánh dấu các ô có thể xây dựng
  document.querySelectorAll(".grid-cell").forEach((cell) => {
    if (!cell.hasChildNodes() && !cell.dataset.terrain) {
      cell.classList.add("buildable");
    } else {
      cell.classList.add("not-buildable");
    }
  });

  // Hiển thị nút hủy chế độ xây dựng
  showCancelBuildButton();

  addNotification(`Chọn vị trí để xây dựng ${getBuildingName(buildingType)}.`);
}

// Hiển thị nút hủy chế độ xây dựng
function showCancelBuildButton() {
  // Xóa nút cũ nếu có
  const oldButton = document.getElementById("cancel-build-button");
  if (oldButton) {
    oldButton.remove();
  }

  // Tạo nút hủy
  const cancelButton = document.createElement("button");
  cancelButton.id = "cancel-build-button";
  cancelButton.className = "cancel-build-button";
  cancelButton.innerHTML = "Hủy Xây Dựng";

  // Thêm sự kiện
  cancelButton.addEventListener("click", () => {
    gameState.buildMode = false;
    gameState.currentBuildingType = null;
    resetBuildingOptions();
    cancelButton.remove();
    addNotification("Đã hủy chế độ xây dựng.");
  });

  // Thêm vào bảng xây dựng
  document.querySelector(".building-panel").appendChild(cancelButton);
}

// Reset trạng thái xây dựng
function resetBuildingOptions() {
  document.querySelectorAll(".building-option").forEach((option) => {
    option.classList.remove("active-option");
  });

  document.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.classList.remove("buildable");
    cell.classList.remove("not-buildable");
  });

  // Xóa nút hủy xây dựng nếu có
  const cancelButton = document.getElementById("cancel-build-button");
  if (cancelButton) {
    cancelButton.remove();
  }
}

// Thêm nhân vật vào giao diện
function addCharacterToUI(character) {
  const charactersList = document.getElementById("characters-list");

  const characterItem = document.createElement("div");
  characterItem.className = "character-item";
  characterItem.id = `character-${character.id}`;

  // Tạo avatar và thông tin nhân vật
  const avatar = document.createElement("div");
  avatar.className = "character-avatar";
  // Sử­ dụng AssetManager để tải avatar
  AssetManager.loadSpriteToElement(avatar, "characters", character.class);

  const info = document.createElement("div");
  info.className = "character-info";
  info.innerHTML = `
    <div class="character-name">${character.name}</div>
    <div class="character-class">${getClassName(character.class)}</div>
    <div class="character-stats">
      HP: ${character.stats.hp} | ATK: ${character.stats.attack}
    </div>
  `;

  // Thêm các phần tử­ con vào item
  characterItem.appendChild(avatar);
  characterItem.appendChild(info);

  // Thêm sự kiện khi click vào nhân vật
  characterItem.addEventListener("click", () => {
    selectCharacter(character.id);
  });

  charactersList.appendChild(characterItem);
}

// Thuê nhân vật mới
function hireCharacter() {
  // Kiểm tra xem có đủ và ng không
  if (gameState.resources.gold < 5) {
    addNotification("Không đủ và ng để thuê nhân vật! Cần í­t nhất 5 và ng.");
    return;
  }

  // Trừ tài nguyên
  gameState.resources.gold -= 5;
  updateResourceDisplay();

  // Tạo nhân vật ngẫu nhiên
  const classes = ["warrior", "archer", "mage"];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];

  const names = [
    "Anh Dũng",
    "Minh Tuấn",
    "Thị Hương",
    "Văn Hải",
    "Thành Công",
    "Thị Lan",
    "Quốc Bảo",
    "Đức Tài",
    "Tuấn Kiệt",
    "Ngọc Ánh",
    "Hoàng Long",
    "Thùy Dương",
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];

  // Các chỉ số tùy theo loại nhân vật
  let stats = {};
  switch (randomClass) {
    case "warrior":
      stats = {
        hp: 100 + Math.floor(Math.random() * 20),
        attack: 8 + Math.floor(Math.random() * 4),
        defense: 5 + Math.floor(Math.random() * 3),
      };
      break;
    case "archer":
      stats = {
        hp: 80 + Math.floor(Math.random() * 15),
        attack: 10 + Math.floor(Math.random() * 5),
        defense: 3 + Math.floor(Math.random() * 2),
      };
      break;
    case "mage":
      stats = {
        hp: 70 + Math.floor(Math.random() * 10),
        attack: 12 + Math.floor(Math.random() * 6),
        defense: 2 + Math.floor(Math.random() * 2),
      };
      break;
  }

  // Tạo nhân vật mới
  const character = {
    id: `char-${Date.now()}`,
    name: randomName,
    class: randomClass,
    level: 1,
    stats: stats,
    equipment: {},
  };

  // Thêm vào danh sách
  gameState.characters.push(character);

  // Cập nhật giao diện
  addCharacterToUI(character);

  // Chọn nhân vật vừa thuê
  selectCharacter(character.id);

  addNotification(
    `Đã thuê ${character.name} (${getClassName(character.class)})!`
  );

  // Hoàn thành nhiệm vụ nếu đây là nhân vật đầu tiên
  if (gameState.characters.length === 1) {
    completeQuest("Thuê nhân vật đầu tiên");
  }
}

// Lấy tên lớp nhân vật
function getClassName(characterClass) {
  const names = {
    warrior: "Chiến binh",
    archer: "Cung thủ",
    mage: "Pháp sư",
  };

  return names[characterClass] || characterClass;
}

// Cập nhật hàm selectCharacter
function selectCharacter(characterId) {
  // Bỏ chọn tất cả các nhân vật trước đó
  const characterElements = document.querySelectorAll(".character-item");
  characterElements.forEach((element) => {
    element.classList.remove("selected");
  });

  // Chọn nhân vật mới
  const selectedCharacter = document.getElementById(`character-${characterId}`);
  if (selectedCharacter) {
    selectedCharacter.classList.add("selected");
    gameState.selectedCharacter = characterId;
  }

  addNotification(
    `Đã chọn ${gameState.characters.find((c) => c.id === characterId).name}`
  );
}

// Hiển thị modal săn bắn
function showHuntingModal() {
  // Kiểm tra và đảm bảo đã chọn nhân vật
  if (!gameState.selectedCharacter) {
    addNotification("Vui lòng chọn một nhân vật trước khi đi săn.");
    return;
  }

  const modal = document.getElementById("hunting-modal");

  // Kiểm tra và cập nhật danh sách quái vật
  updateMonsterList();

  // Kiểm tra và cập nhật danh sách đội săn bắn
  updateHuntingGroups();

  // Đảm bảo nút đóng hoạt động
  const closeButton = modal.querySelector(".close-button");
  if (closeButton) {
    closeButton.onclick = () => {
      modal.style.display = "none";
    };
  }

  const huntingCloseButton = document.getElementById("hunting-close-button");
  if (huntingCloseButton) {
    huntingCloseButton.onclick = () => {
      modal.style.display = "none";
    };
  }

  // Hiển thị modal
  modal.style.display = "block";
}

// Thêm hàm khởi tạo các modal và đảm bảo việc đóng modal hoạt động đúng
function initModalClosing() {
  // Lấy tất cả các modal
  const modals = document.querySelectorAll(".modal");

  // Thêm chức năng đóng cho mỗi modal
  modals.forEach((modal) => {
    // Đóng modal khi click vào nút đóng
    const closeButton = modal.querySelector(".close-button");
    if (closeButton) {
      closeButton.onclick = () => {
        modal.style.display = "none";
      };
    }

    // Đóng modal khi click ra ngoà i nội dung modal
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  });

  // Nút đóng trong modal săn bắn
  const huntingCloseButton = document.getElementById("hunting-close-button");
  if (huntingCloseButton) {
    huntingCloseButton.onclick = () => {
      document.getElementById("hunting-modal").style.display = "none";
    };
  }

  // Nút đóng trong modal thông tin công trình
  const modalCancelButton = document.getElementById("modal-cancel-button");
  if (modalCancelButton) {
    modalCancelButton.onclick = () => {
      document.getElementById("building-modal").style.display = "none";
    };
  }
}

// Tạo thanh công cụ game
function createGameToolbar() {
  const toolbar = document.createElement("div");
  toolbar.className = "game-toolbar";
  toolbar.innerHTML = `
    <button id="save-game-button" title="Lưu Game"><i class="ra ra-save"></i></button>
    <button id="help-button" title="Trợ Giúp"><i class="ra ra-help"></i></button>
    <button id="settings-button" title="Cài Đặt"><i class="ra ra-cog"></i></button>
  `;

  document.querySelector(".game-container").appendChild(toolbar);

  // Thêm sự kiện cho các nút
  document
    .getElementById("save-game-button")
    .addEventListener("click", saveGame);
  document.getElementById("help-button").addEventListener("click", showHelp);
  document
    .getElementById("settings-button")
    .addEventListener("click", showSettings);
}

// Hàm lưu game
function saveGame() {
  try {
    // Chuẩn bị dữ liệu lưu
    const saveData = {
      resources: { ...gameState.resources },
      buildings: gameState.buildings.map((b) => ({ ...b })),
      characters: gameState.characters.map((c) => ({ ...c })),
      progression: {
        tutorial: { ...gameState.progression.tutorial },
        quests: { ...gameState.progression.quests },
        collectedResources: { ...gameState.progression.collectedResources },
      },
      tutorialStep: gameState.tutorialStep,
      lastSaveTime: new Date().toISOString(),
    };

    // Lưu vào localStorage
    localStorage.setItem("wildernessHavenSave", JSON.stringify(saveData));

    // Cập nhật thời gian lưu cuối cùng
    gameState.lastSaveTime = saveData.lastSaveTime;

    // Hiển thị thông báo
    addNotification("Đã lưu tiến trình game thành công!");

    // Hiển thị hiệu ứng
    showSaveEffect();

    return true;
  } catch (error) {
    console.error("Lỗi khi lưu game:", error);
    addNotification("Lỗi khi lưu game! Vui lòng thử lại.");
    return false;
  }
}

// Hiển thị hiệu ứng lưu game
function showSaveEffect() {
  const saveButton = document.getElementById("save-game-button");
  saveButton.classList.add("button-flash");

  setTimeout(() => {
    saveButton.classList.remove("button-flash");
  }, 1000);
}

// Hiển thị trợ giúp
function showHelp() {
  const helpModal = document.createElement("div");
  helpModal.className = "modal";
  helpModal.id = "help-modal";
  helpModal.innerHTML = `
    <div class="modal-content help-content">
      <span class="close-button">&times;</span>
      <h2>Hướng Dẫn Chơi</h2>
      <div class="help-sections">
        <div class="help-section">
          <h3>Cơ Bản</h3>
          <ul>
            <li>Thu thập <b>gỗ</b> bằng cách nhấp vào cây</li>
            <li>Thu thập <b>đá</b> bằng cách nhấp vào đá</li>
            <li>Xây dựng công trình từ bảng bên phải</li>
            <li>Thuê nhân vật để bảo vệ khu định cư</li>
          </ul>
        </div>
        <div class="help-section">
          <h3>Xây Dựng</h3>
          <ul>
            <li><b>Nhà ở</b>: Cung cấp chỗ ở cho nhân vật</li>
            <li><b>Xưởng chế tạo</b>: Tăng tốc độ sản xuất</li>
            <li><b>Trạm canh gác</b>: Bảo vệ khu định cư</li>
            <li><b>Nông trại</b>: Sản xuất thức ăn</li>
          </ul>
        </div>
        <div class="help-section">
          <h3>Nhân Vật</h3>
          <ul>
            <li><b>Chiến binh</b>: Mạnh trong chiến đấu</li>
            <li><b>Cung thủ</b>: Tấn công từ xa</li>
            <li><b>Pháp sư</b>: Có kử¹ năng đặc biệt</li>
          </ul>
        </div>
      </div>
      <div class="help-footer">
        <button id="help-close-button">Đóng</button>
      </div>
    </div>
  `;

  document.body.appendChild(helpModal);

  // Hiển thị modal
  helpModal.style.display = "block";

  // Thêm sự kiện đóng
  document
    .querySelector("#help-modal .close-button")
    .addEventListener("click", () => {
      helpModal.remove();
    });

  document.getElementById("help-close-button").addEventListener("click", () => {
    helpModal.remove();
  });
}

// Hiển thị cà i Đặt
function showSettings() {
  const settingsModal = document.createElement("div");
  settingsModal.className = "modal";
  settingsModal.id = "settings-modal";
  settingsModal.innerHTML = `
    <div class="modal-content settings-content">
      <span class="close-button">&times;</span>
      <h2>Cà i Đặt</h2>
      <div class="settings-options">
        <div class="setting-option">
          <label for="music-volume">í‚m nhạc</label>
          <input type="range" id="music-volume" min="0" max="100" value="50">
        </div>
        <div class="setting-option">
          <label for="sound-volume">í‚m thanh</label>
          <input type="range" id="sound-volume" min="0" max="100" value="70">
        </div>
        <div class="setting-option">
          <label for="auto-save">Tự động lưu</label>
          <input type="checkbox" id="auto-save" checked>
        </div>
      </div>
      <div class="danger-zone">
        <h3>Khu vực nguy hiểm</h3>
        <button id="reset-game-button" class="danger-button">Xóa dữ liệu và bắt đầu lại</button>
      </div>
      <div class="settings-footer">
        <button id="settings-close-button">Lưu và đóng</button>
      </div>
    </div>
  `;

  document.body.appendChild(settingsModal);

  // Hiển thị modal
  settingsModal.style.display = "block";

  // Thêm sự kiện đóng
  document
    .querySelector("#settings-modal .close-button")
    .addEventListener("click", () => {
      settingsModal.remove();
    });

  document
    .getElementById("settings-close-button")
    .addEventListener("click", () => {
      settingsModal.remove();
    });

  // Thêm sự kiện xóa dữ liệu
  document.getElementById("reset-game-button").addEventListener("click", () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả dữ liệu và bắt đầu lại? Hành động nà y không thể hoàn tác!"
      )
    ) {
      localStorage.removeItem("wildernessHavenSave");
      location.reload();
    }
  });
}

// Bắt đầu tự động lưu
function startAutoSave() {
  // Lưu game tự động mỗi 5 phút
  const autoSaveInterval = setInterval(() => {
    if (gameState.gameStarted) {
      const saved = saveGame();
      if (saved) {
        console.log("Tự động lưu: " + new Date().toLocaleString());
      }
    } else {
      clearInterval(autoSaveInterval);
    }
  }, 5 * 60 * 1000); // 5 phút
}

// Đặt lại bản đồ và chuẩn bị xây dựng lại
function resetMap() {
  const gridContainer = document.getElementById("grid-container");
  gridContainer.innerHTML = "";
  createGrid();
  generateTerrain();
}

// Xây dựng lại trạng thái game từ dữ liệu đã lưu
function rebuildGameState() {
  // Cập nhật hiển thị tài nguyên
  updateResourceDisplay();

  // Xây dựng lại các công trình
  rebuildBuildings();

  // Khôi phục nhân vật
  rebuildCharacters();

  // Cập nhật nhiệm vụ
  updateQuestStatus();

  // Đặt game đã bắt đầu
  gameState.gameStarted = true;
}

// Xây dựng lại các công trình từ dữ liệu đã lưu
function rebuildBuildings() {
  // Tạo lại từng công trình trên bản đồ
  gameState.buildings.forEach((building) => {
    const cell = document.querySelector(
      `.grid-cell[data-row="${building.row}"][data-col="${building.col}"]`
    );

    if (cell) {
      // Tạo phần tử­ HTML cho công trình
      const buildingElement = document.createElement("div");
      buildingElement.className = "building " + building.type;
      buildingElement.dataset.type = building.type;
      buildingElement.dataset.level = building.level;

      // Tải hình ảnh
      AssetManager.loadSpriteToElement(
        buildingElement,
        "buildings",
        building.type
      );

      // Thêm chỉ số cấp độ
      const levelIndicator = document.createElement("div");
      levelIndicator.className = "building-level";
      levelIndicator.textContent = `Lv.${building.level}`;
      buildingElement.appendChild(levelIndicator);

      // Thêm vào cell
      cell.appendChild(buildingElement);
    }
  });
}

// Khôi phục lại nhân vật từ dữ liệu đã lưu
function rebuildCharacters() {
  // Xóa danh sách nhân vật hiện tại
  const charactersList = document.getElementById("characters-list");
  charactersList.innerHTML = "";

  // Thêm lại từng nhân vật từ dữ liệu đã lưu
  gameState.characters.forEach((character) => {
    addCharacterToUI(character);
  });
}

// Cập nhật trạng thái nhiệm vụ theo dữ liệu đã lưu
function updateQuestStatus() {
  const questList = document.getElementById("quest-log").querySelector("ul");
  const quests = questList.querySelectorAll("li");

  // Đánh dấu hoàn thành cho các nhiệm vụ đã hoàn thành
  for (const quest of quests) {
    const questText = quest.textContent.trim();

    if (
      gameState.progression.quests.buildFirstHouse &&
      questText === "Xây dựng nhà ở đầu tiên"
    ) {
      quest.classList.add("quest-completed");
    } else if (
      gameState.progression.quests.collectResources &&
      questText === "Thu thập 10 gỗ"
    ) {
      quest.classList.add("quest-completed");
    } else if (
      gameState.progression.quests.hireFirstCharacter &&
      questText === "Thuê nhân vật đầu tiên"
    ) {
      quest.classList.add("quest-completed");
    } else if (
      gameState.progression.quests.goHunting &&
      questText === "Gửi nhân vật đi săn"
    ) {
      quest.classList.add("quest-completed");
    }
  }
}

// Hàm tải game đã lưu
function loadGame() {
  try {
    const savedGame = localStorage.getItem("wildernessHavenSave");

    if (!savedGame) {
      addNotification("Không tìm thấy dữ liệu đã lưu!");
      return false;
    }

    const saveData = JSON.parse(savedGame);

    // Khôi phục dữ liệu từ bản lưu
    gameState.resources = { ...saveData.resources };
    gameState.buildings = saveData.buildings.map((b) => ({ ...b }));
    gameState.characters = saveData.characters.map((c) => ({ ...c }));
    gameState.progression = {
      tutorial: { ...saveData.progression.tutorial },
      quests: { ...saveData.progression.quests },
      collectedResources: { ...saveData.progression.collectedResources },
    };
    gameState.tutorialStep = saveData.tutorialStep;
    gameState.lastSaveTime = saveData.lastSaveTime;

    // Ẩn màn hình bắt đầu
    const startScreen = document.querySelector(".start-screen");
    if (startScreen) {
      startScreen.style.display = "none";
    }

    // Hiển thị giao diện game
    document.querySelector(".game-area").style.display = "flex";
    document.querySelector(".resource-panel").style.display = "flex";
    document.querySelector(".notification-panel").style.display = "flex";

    // Tạo lại bản đồ và cập nhật giao diện
    resetMap();
    rebuildGameState();

    // Hiển thị thanh công cụ game
    createGameToolbar();

    // Hiển thị thông báo
    addNotification("Đã tải game thành công! Tiếp tục cuộc phiêu lưu của bạn.");

    // Bắt đầu tự động lưu
    startAutoSave();

    return true;
  } catch (error) {
    console.error("Lỗi khi tải game:", error);
    addNotification("Lỗi khi tải game! Dữ liệu có thể đã hỏng.");
    return false;
  }
}

// Cập nhật danh sách quái vật trong modal săn bắn
function updateMonsterList() {
  const monsterListContainer = document.getElementById("monster-list");
  if (!monsterListContainer) return;

  // Xóa danh sách cũ
  monsterListContainer.innerHTML = "";

  // Thêm quái vật vào danh sách
  gameState.monsters.forEach((monster) => {
    const monsterItem = document.createElement("div");
    monsterItem.className = "monster-item";
    monsterItem.dataset.monsterId = monster.id;

    // Tạo hình ảnh quái vật
    const monsterImage = document.createElement("div");
    monsterImage.className = "monster-image";
    AssetManager.loadSpriteToElement(monsterImage, "monsters", monster.type);

    // Tạo thông tin quái vật
    const monsterInfo = document.createElement("div");
    monsterInfo.className = "monster-info";
    monsterInfo.innerHTML = `
      <div class="monster-name">${monster.name}</div>
      <div class="monster-stats">HP: ${monster.health} | Sức mạnh: ${
      monster.damage
    }</div>
      <div class="monster-difficulty">Độ khó: ${"★".repeat(
        monster.difficulty
      )}</div>
    `;

    // Tạo nút săn
    const huntButton = document.createElement("button");
    huntButton.className = "hunt-button";
    huntButton.textContent = "Săn";
    huntButton.onclick = () => {
      startHunt(monster.id);
    };

    // Thêm các phần tử­ con vào item
    monsterItem.appendChild(monsterImage);
    monsterItem.appendChild(monsterInfo);
    monsterItem.appendChild(huntButton);

    // Thêm vào container
    monsterListContainer.appendChild(monsterItem);
  });
}

// Cập nhật danh sách các đội săn bắn
function updateHuntingGroups() {
  const huntingGroupsContainer = document.getElementById("hunting-groups");
  if (!huntingGroupsContainer) return;

  // Xóa danh sách cũ
  huntingGroupsContainer.innerHTML = "";

  // Kiểm tra nếu không có nhóm săn bắn
  if (gameState.huntingGroups.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Chưa có đội săn bắn nào.";
    huntingGroupsContainer.appendChild(emptyMessage);
    return;
  }

  // Thêm từng nhóm săn bắn vào danh sách
  gameState.huntingGroups.forEach((group, index) => {
    const groupItem = document.createElement("div");
    groupItem.className = "hunting-group";

    // Tìm character và monster
    const character = gameState.characters.find(
      (c) => c.id === group.characterId
    );
    const monster = gameState.monsters.find((m) => m.id === group.monsterId);

    if (!character || !monster) return;

    // Tạo thông tin nhóm
    groupItem.innerHTML = `
      <div class="group-header">Đội săn ${index + 1}</div>
      <div class="group-info">
        <span>${character.name} đang săn ${monster.name}</span>
        <div class="progress-bar">
          <div class="progress" style="width: ${group.progress}%"></div>
        </div>
        <span>${Math.floor(group.progress)}%</span>
      </div>
    `;

    // Thêm nút hủy săn bắn
    const cancelButton = document.createElement("button");
    cancelButton.className = "cancel-hunt-button";
    cancelButton.textContent = "Hủy";
    cancelButton.onclick = () => {
      cancelHunt(index);
    };

    groupItem.appendChild(cancelButton);

    // Thêm vào container
    huntingGroupsContainer.appendChild(groupItem);
  });
}

// Bắt đầu cuộc săn bắn
function startHunt(monsterId) {
  // Kiểm tra xem có nhân vật nào được chọn không
  if (!gameState.selectedCharacter) {
    addNotification("Vui lòng chọn một nhân vật để đi săn.");
    return;
  }

  // Kiểm tra xem nhân vật đã tham gia nhóm săn bắn nào chưa
  const alreadyHunting = gameState.huntingGroups.some(
    (group) => group.characterId === gameState.selectedCharacter
  );

  if (alreadyHunting) {
    addNotification("Nhân vật nà y đang tham gia một nhóm săn bắn khác.");
    return;
  }

  // Tìm quái vật
  const monster = gameState.monsters.find((m) => m.id === monsterId);
  if (!monster) {
    addNotification("Không tìm thấy quái vật.");
    return;
  }

  // Tìm nhân vật
  const character = gameState.characters.find(
    (c) => c.id === gameState.selectedCharacter
  );
  if (!character) {
    addNotification("Không tìm thấy nhân vật.");
    return;
  }

  // Tạo nhóm săn bắn mới
  const newHuntingGroup = {
    characterId: character.id,
    monsterId: monster.id,
    progress: 0, // Tiến độ săn bắn từ 0-100%
    timeStarted: Date.now(),
    estimatedDuration: monster.difficulty * 30000, // 30 giây * độ khó
  };

  // Thêm vào danh sách
  gameState.huntingGroups.push(newHuntingGroup);

  // Cập nhật giao diện
  updateHuntingGroups();

  // Bắt đầu tiến trình săn bắn
  addNotification(
    `${character.name} đã bắt đầu săn ${monster.name}. Dự kiến hoàn thành sau ${
      monster.difficulty * 30
    } giây.`
  );

  // Hoàn thành nhiệm vụ nếu đây là lần săn đầu tiên
  if (gameState.huntingGroups.length === 1) {
    completeQuest("Gửi nhân vật đi săn");
  }

  // Bắt đầu theo dõi tiến độ săn bắn
  startHuntingProgress();
}

// Hủy cuộc săn bắn
function cancelHunt(groupIndex) {
  // Kiểm tra xem nhóm săn bắn có tồn tại không
  if (groupIndex < 0 || groupIndex >= gameState.huntingGroups.length) {
    addNotification("Không tìm thấy nhóm săn bắn.");
    return;
  }

  // Lấy thông tin nhóm săn bắn
  const group = gameState.huntingGroups[groupIndex];
  const character = gameState.characters.find(
    (c) => c.id === group.characterId
  );
  const monster = gameState.monsters.find((m) => m.id === group.monsterId);

  if (character && monster) {
    addNotification(
      `${character.name} đã dừng săn ${monster.name}. Tiến độ đã mất.`
    );
  }

  // Xóa nhóm săn bắn
  gameState.huntingGroups.splice(groupIndex, 1);

  // Cập nhật giao diện
  updateHuntingGroups();
}

// Bắt đầu theo dõi tiến độ của tất cả các nhóm săn bắn
function startHuntingProgress() {
  // Kiểm tra xem đã có interval chạy chưa
  if (window.huntingInterval) {
    return; // Đã có interval đang chạy
  }

  // Tạo interval để cập nhật tiến độ
  window.huntingInterval = setInterval(() => {
    let activeHunts = false;

    // Duyệt qua từng nhóm săn bắn
    for (let i = 0; i < gameState.huntingGroups.length; i++) {
      const group = gameState.huntingGroups[i];
      activeHunts = true;

      // Tí­nh toán tiến độ dựa trên thời gian
      const elapsedTime = Date.now() - group.timeStarted;
      const progress = (elapsedTime / group.estimatedDuration) * 100;

      // Cập nhật tiến độ
      group.progress = Math.min(progress, 100);

      // Nếu đã hoàn thành
      if (group.progress >= 100) {
        completeHunt(i);
        i--; // Giảm index vì đã xóa một phần tử­
      }
    }

    // Cập nhật giao diện
    updateHuntingGroups();

    // Dừng interval nếu không còn nhóm săn bắn nào
    if (!activeHunts) {
      clearInterval(window.huntingInterval);
      window.huntingInterval = null;
    }
  }, 1000); // Cập nhật mỗi giây
}

// Hoàn thành cuộc săn bắn
function completeHunt(groupIndex) {
  // Kiểm tra xem nhóm săn bắn có tồn tại không
  if (groupIndex < 0 || groupIndex >= gameState.huntingGroups.length) {
    return;
  }

  // Lấy thông tin nhóm săn bắn
  const group = gameState.huntingGroups[groupIndex];
  const character = gameState.characters.find(
    (c) => c.id === group.characterId
  );
  const monster = gameState.monsters.find((m) => m.id === group.monsterId);

  if (!character || !monster) {
    gameState.huntingGroups.splice(groupIndex, 1);
    return;
  }

  // Tí­nh toán kết quả săn bắn
  const success = calculateHuntSuccess(character, monster);

  if (success) {
    // Thêm phần thưởng vào kho tài nguyên
    for (const resource in monster.loot) {
      gameState.resources[resource] += monster.loot[resource];
    }

    // Thông báo kết quả
    let rewardText = "";
    for (const resource in monster.loot) {
      rewardText += `${monster.loot[resource]} ${getResourceName(resource)}, `;
    }
    rewardText = rewardText.slice(0, -2); // Xóa dấu phẩy và khoảng trắng ở cuối

    addNotification(
      `${character.name} đã săn thành công ${monster.name}! Phần thưởng: ${rewardText}.`
    );

    // Cập nhật hiển thị tài nguyên
    updateResourceDisplay();
  } else {
    addNotification(
      `${character.name} không săn được ${monster.name}. Hãy thử lại với nhân vật mạnh hơn.`
    );
  }

  // Xóa nhóm săn bắn
  gameState.huntingGroups.splice(groupIndex, 1);
}

// Tí­nh toán kết quả săn bắn dựa trên sức mạnh nhân vật và quái vật
function calculateHuntSuccess(character, monster) {
  // Tí­nh tử•ng sức mạnh của nhân vật
  const characterPower = character.stats.attack + character.stats.defense / 2;

  // Tí­nh sức mạnh của quái vật
  const monsterPower = monster.damage + monster.health / 10;

  // Tỷ lệ thành công
  const successRate = (characterPower / monsterPower) * 0.8; // 80% tối đa

  // Xác suất thành công tối thiểu 10%, tối đa 95%
  const finalRate = Math.max(0.1, Math.min(0.95, successRate));

  // Quyết định kết quả
  return Math.random() < finalRate;
}

// Khởi tạo và quản lý hướng dẫn game
function startTutorial() {
  // Không hiển thị hướng dẫn nếu đã chơi trước đó
  if (gameState.progression.tutorial.welcomeShown) {
    return;
  }

  // Hiển thị hướng dẫn chào mừng
  const welcomeMessage = `
    <div class="tutorial-message">
      <h3>Chào mừng đến với Wilderness Haven!</h3>
      <p>Bạn cần xây dựng khu định cư của mình trong vùng hoang dã nguy hiểm này.</p>
      <p>Đầu tiên, hãy thu thập tài nguyên bằng cách nhấp vào cây và đá trên bản đồ.</p>
      <button id="tutorial-next">Tiếp tục</button>
    </div>
  `;

  // Tạo và hiển thị hộp thoại hướng dẫn
  showTutorialDialog(welcomeMessage, () => {
    gameState.progression.tutorial.welcomeShown = true;
    gameState.tutorialStep = 1;
    continueToNextTutorialStep();
  });

  // Thêm nhiệm vụ ban đầu
  initializeQuestLog();
}

// Hiển thị hộp thoại hướng dẫn
function showTutorialDialog(message, onComplete) {
  // Tạo phần tử­ hộp thoại
  const tutorialOverlay = document.createElement("div");
  tutorialOverlay.className = "tutorial-overlay";
  tutorialOverlay.innerHTML = message;

  // Thêm vào DOM
  document.body.appendChild(tutorialOverlay);

  // Thêm sự kiện cho nút
  const nextButton = document.getElementById("tutorial-next");
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      tutorialOverlay.remove();
      if (onComplete) onComplete();
    });
  }
}

// Tiếp tục đến bước hướng dẫn tiếp theo
function continueToNextTutorialStep() {
  switch (gameState.tutorialStep) {
    case 1:
      // Hướng dẫn về tài nguyên
      setTimeout(() => {
        const resourceMessage = `
          <div class="tutorial-message">
            <h3>Tài nguyên</h3>
            <p>Bạn cần thu thập gỗ và đá để xây dựng công trình.</p>
            <p>Cây sẽ cung cấp gỗ, và đá sẽ cung cấp đá. Thức ăn cần thiết để duy trì khu định cư.</p>
            <button id="tutorial-next">Tiếp tục</button>
          </div>
        `;

        showTutorialDialog(resourceMessage, () => {
          gameState.progression.tutorial.resourcesIntroduced = true;
          gameState.tutorialStep = 2;
          continueToNextTutorialStep();
        });
      }, 3000);
      break;

    case 2:
      // Hướng dẫn về xây dựng
      setTimeout(() => {
        const buildingMessage = `
          <div class="tutorial-message">
            <h3>Xây dựng</h3>
            <p>Nhấp vào một công trình ở bảng bên phải để bắt đầu xây dựng.</p>
            <p>Sau đó, chọn một vị trí trống trên bản đồ để đặt công trình.</p>
            <p>Mỗi công trình có chức năng khác nhau, hãy thử xây một nhà ở trước!</p>
            <button id="tutorial-next">Tiếp tục</button>
          </div>
        `;

        showTutorialDialog(buildingMessage, () => {
          gameState.progression.tutorial.buildingIntroduced = true;
          gameState.tutorialStep = 3;
        });
      }, 3000);
      break;

    // Thêm các bước hướng dẫn khác nếu cần
  }
}

// Khởi tạo danh sách nhiệm vụ
function initializeQuestLog() {
  const questLog = document.getElementById("quest-log");
  if (!questLog) return;

  const questList =
    questLog.querySelector("ul") || document.createElement("ul");

  // Xóa các nhiệm vụ cũ nếu có
  questList.innerHTML = "";

  // Thêm các nhiệm vụ ban đầu
  const initialQuests = [
    "Xây dựng nhà ở đầu tiên",
    "Thu thập 10 gỗ",
    "Thuê nhân vật đầu tiên",
    "Gửi nhân vật đi săn",
  ];

  initialQuests.forEach((quest) => {
    const questItem = document.createElement("li");
    questItem.textContent = quest;
    questList.appendChild(questItem);
  });

  // Đảm bảo questList đã được thêm vào questLog
  if (!questLog.contains(questList)) {
    questLog.appendChild(questList);
  }
}

// Kiểm tra và cập nhật tiến trình
function checkProgressionUpdates() {
  // Kiểm tra thu thập tài nguyên
  const woodCollected = gameState.progression.collectedResources.wood;
  const stoneCollected = gameState.progression.collectedResources.stone;

  // Hoàn thành nhiệm vụ thu thập gỗ
  if (woodCollected >= 10 && !gameState.progression.quests.collectResources) {
    gameState.progression.quests.collectResources = true;
    completeQuest("Thu thập 10 gỗ");
  }

  // Có thể thêm các kiểm tra khác tại đây

  // Cập nhật thanh tiến trình của nhiệm vụ
  updateQuestProgress();
}

// Cập nhật thanh tiến trình của nhiệm vụ
function updateQuestProgress() {
  // Lấy danh sách nhiệm vụ
  const questList = document.getElementById("quest-log").querySelector("ul");
  const quests = questList.querySelectorAll("li");

  // Duyệt qua từng nhiệm vụ và cập nhật tiến trình
  for (const quest of quests) {
    const questText = quest.textContent.trim();

    // Nếu là nhiệm vụ thu thập tài nguyên
    if (
      questText === "Thu thập 10 gỗ" &&
      !quest.classList.contains("quest-completed")
    ) {
      const progress = Math.min(
        1,
        gameState.progression.collectedResources.wood / 10
      );
      updateQuestItemProgress(quest, progress);
    }

    // Thêm các nhiệm vụ khác tại đây khi cần
  }
}

// Cập nhật tiến trình cho một mục nhiệm vụ cụ thể
function updateQuestItemProgress(questItem, progress) {
  // Tìm hoặc tạo thanh tiến trình
  let progressBar = questItem.querySelector(".quest-progress");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "quest-progress";

    const progressFill = document.createElement("div");
    progressFill.className = "quest-progress-fill";
    progressBar.appendChild(progressFill);

    questItem.appendChild(progressBar);
  }

  // Cập nhật giá trị
  const progressFill = progressBar.querySelector(".quest-progress-fill");
  if (progressFill) {
    progressFill.style.width = `${progress * 100}%`;
  }
}

// Khởi tạo game khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  // Đặt lại các cài đặt
  gameState.mapControls = {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
  };

  // Khởi tạo game
  initGame();
});
