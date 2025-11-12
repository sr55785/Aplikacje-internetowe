const mapDiv = document.getElementById("map");
const btnGetLocation = document.getElementById("getLocation");
const btnSaveLocation = document.getElementById("saveLocation");
const puzzleContainer = document.getElementById("puzzle");
const board = document.getElementById("board");
const rasterDiv = document.getElementById("raster");

const map = L.map(mapDiv).setView([52.2297, 21.0122], 13);
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  crossOrigin: true,
  attribution: "&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community"
}).addTo(map);

let userMarker = null;

btnGetLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 15);
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("Twoja lokalizacja")
      .openPopup();
  }, err => {
    alert("Błąd geolokalizacji: " + err.message);
  });
});

btnSaveLocation.addEventListener("click", () => {
  leafletImage(map, (err, canvas) => {
    if (err) {
      alert("Nie udało się zrzucić mapy do obrazu.");
      console.error(err);
      return;
    }

    const dataURL = canvas.toDataURL("image/png");

    rasterDiv.innerHTML = "";
    const rasterImg = document.createElement("img");
    rasterImg.src = dataURL;
    rasterDiv.appendChild(rasterImg);

    createPuzzleFromImage(dataURL);
  });
});

function createPuzzleFromImage(dataURL) {
  puzzleContainer.innerHTML = "";
  board.innerHTML = "";

  const img = new Image();
  img.onload = () => {
    const cols = 4, rows = 4;
    const pieceW = Math.floor(img.width / cols);
    const pieceH = Math.floor(img.height / rows);

    const tmp = document.createElement("canvas");
    tmp.width = pieceW;
    tmp.height = pieceH;
    const ctx = tmp.getContext("2d");

    const pieces = [];
    let index = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.clearRect(0, 0, pieceW, pieceH);
        ctx.drawImage(img, x * pieceW, y * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
        pieces.push({ data: tmp.toDataURL(), correctIndex: index });
        index++;
      }
    }

    for (let i = 0; i < cols * rows; i++) {
      const slot = document.createElement("div");
      slot.classList.add("drop-slot");
      slot.dataset.expectedIndex = i;
      slot.addEventListener("dragover", onDragOver);
      slot.addEventListener("drop", onDrop);
      slot.addEventListener("dragleave", () => slot.classList.remove("dragover"));
      board.appendChild(slot);
    }

    shuffleArray(pieces);
    for (let i = 0; i < pieces.length; i++) {
      const tile = document.createElement("img");
      tile.src = pieces[i].data;
      tile.draggable = true;
      tile.dataset.correctIndex = pieces[i].correctIndex;
      tile.addEventListener("dragstart", onDragStart);
      tile.addEventListener("dragend", onDragEnd);
      puzzleContainer.appendChild(tile);
    }
  };
  img.src = dataURL;
}

let draggedEl = null;

function onDragStart(e) {
  draggedEl = e.target;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "dragged");
  setTimeout(() => draggedEl.classList.add("dragging"), 0);
}

function onDragEnd() {
  if (draggedEl) draggedEl.classList.remove("dragging");
  draggedEl = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("dragover");
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("dragover");

  if (!draggedEl) return;
  const existing = e.currentTarget.querySelector("img");
  if (existing) puzzleContainer.appendChild(existing);
  e.currentTarget.appendChild(draggedEl);
  checkIfSolved();
}

function checkIfSolved() {
  const slots = [...board.querySelectorAll(".drop-slot")];
  let correct = 0;
  for (let i = 0; i < slots.length; i++) {
    const img = slots[i].querySelector("img");
    if (!img) continue;
    if (Number(img.dataset.correctIndex) === Number(slots[i].dataset.expectedIndex)) correct++;
  }
  console.log(`Poprawnych: ${correct}/${slots.length}`);
  if (correct === slots.length) showNotification();
}

function showNotification() {
  if (Notification.permission === "granted") {
    new Notification("Brawo!", { body: "Ułożyłeś wszystkie puzzle" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") {
        new Notification("Brawo!", { body: "Ułożyłeś wszystkie puzzle" });
      }
    });
  } else {
    alert("Ułożyłeś wszystkie puzzle");
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

(function initBoard() {
  const total = 16;
  for (let i = 0; i < total; i++) {
    const slot = document.createElement("div");
    slot.classList.add("drop-slot");
    slot.dataset.expectedIndex = i;
    slot.addEventListener("dragover", onDragOver);
    slot.addEventListener("drop", onDrop);
    slot.addEventListener("dragleave", () => slot.classList.remove("dragover"));
    board.appendChild(slot);
  }
})();
