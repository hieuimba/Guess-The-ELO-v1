const shade = document.getElementById("shade");
const gameScreen = document.getElementById("gameScreen");
const boardContainer = document.getElementById("boardContainer");
const eloButtonsContainer = document.getElementById("eloButtonsContainer");
const nextGameButton = document.getElementById("nextGameButton");
const viewResultButton = document.getElementById("viewResultButton");
const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

function offsetHeight() {
  let offsetHeight;
  if (
    nextGameButton.offsetHeight === 0 &&
    viewResultButton.offsetHeight === 0
  ) {
    offsetHeight =
      (window.innerHeight - gameScreen.offsetHeight) / 2 -
      (eloButtonsContainer.firstElementChild.offsetHeight + 4.75 * rem) / 4;
  } else {
    offsetHeight = (window.innerHeight - gameScreen.offsetHeight) / 2;
  }
  if (gameScreen.style.display === "block") {
    document.body.style.alignItems = "stretch";
    shade.style.transform = `translateY(${offsetHeight}px)`;
  } else {
    document.body.style.alignItems = "center";
    shade.style.transform = "";
  }
}

function adjustEloButtonLayout() {
  const viewportHeight = window.innerHeight;
  const elementHeight = boardContainer.offsetHeight;
  // console.log(elementHeight, viewportHeight / 1.5);
  if (elementHeight < viewportHeight / 1.5) {
    // Adjust the condition as needed
    eloButtonsContainer.style.gridTemplateColumns = "1fr 1fr";
  } else {
    eloButtonsContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  }
}

export function adjustScreen() {
  adjustEloButtonLayout();
  offsetHeight();
}

const resizeObserver = new ResizeObserver(() => {
  adjustEloButtonLayout();
});
resizeObserver.observe(boardContainer);
window.addEventListener("resize", adjustScreen);

const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "center",
    y: "top",
  },
  ripple: false,
  dismissible: true,
  types: [
    {
      type: "info",
      background: "grey",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="notyfIcon" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',
    },
  ],
});

window.addEventListener("load", function () {
  var body = document.body;
  var html = document.documentElement;

  var bodyHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  var viewHeight = window.innerHeight;

  if (bodyHeight > viewHeight) {
    // Create an instance of Notyf
    notyf.open({
      type: "info",
      message:
        "Content exceeds screen size!<br>For the best experience, enable fullscreen mode or try Ctrl - to zoom out.",
    });
  }
});
