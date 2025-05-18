// chess.js
const chessboard = document.getElementById("chessboard");

const initialPosition = [
  ["black_rook", "black_knight", "black_bishop", "black_queen", "black_king", "black_bishop2", "black_knight2", "black_rook2"],
  ["black_pawn1", "black_pawn2", "black_pawn3", "black_pawn4", "black_pawn5", "black_pawn6", "black_pawn7", "black_pawn8"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["white_pawn1", "white_pawn2", "white_pawn3", "white_pawn4", "white_pawn5", "white_pawn6", "white_pawn7", "white_pawn8"],
  ["white_rook", "white_knight", "white_bishop", "white_queen", "white_king", "white_bishop", "white_knight2", "white_rook"]
];

const preloadImages = (urls) => {
  urls.forEach(url => {
    const images = new Image();
    images.src = url;
  });
};


function getPartRouter(posision) {
 const parts = new Set();

 posision.forEach(piece => {
  const basepath = '/images/${piece}';
  parts.add('${basepath}.png');
  parts.add('${basepath}_drag.png');
 });

 return Array.from(parts);
}

const parts = getPartRouter(initialPosition);
preloadImages(parts);

//Lista de imágenes que quieres precargar
// preloadImages([
  // "images/black_rook.png",

function createChessboard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.className = "square " + ((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.row = row;
      square.dataset.col = col;

      const pieceName = initialPosition[row][col];
      if (pieceName) {
        const piece = document.createElement("div");
        piece.className = "piece";
        piece.style.backgroundImage = `url(images/${pieceName}.png)`;
        piece.setAttribute("draggable", true);
        piece.dataset.name = pieceName;

  

        piece.addEventListener("dragstart", (e) => {
          piece.style.backgroundImage = `url(images/${pieceName}_drag.png)`;
          e.dataTransfer.setData("text/plain", pieceName);
          setTimeout(() => {
            piece.style.display = "none";
          }, 0);
        });

        piece.addEventListener("dragend", (e) => {
          piece.style.display = "block";
          piece.style.backgroundImage = `url(images/${pieceName}.png)`;
        });

        square.appendChild(piece);
      }

      square.addEventListener("dragover", (e) => e.preventDefault());
      square.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedName = e.dataTransfer.getData("text/plain");
        const oldPiece = document.querySelector(`[data-name="${draggedName}"]`);

        if (oldPiece && square !== oldPiece.parentNode) {
          square.innerHTML = "";
          square.appendChild(oldPiece);
        }

        oldPiece.style.backgroundImage = `url(images/${draggedName}.png)`;
        oldPiece.style.display = "block";
      });

      chessboard.appendChild(square);
    }
  }
}


createChessboard();

