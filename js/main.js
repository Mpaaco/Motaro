const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
  toggle.classList.toggle("active");
});

// Fechar menu com ESC ou clicando fora
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    menu.classList.remove("active");
    toggle.classList.remove("active");
  }
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove("active");
    toggle.classList.remove("active");
  }
});

/* =========================================
   LOADING SCREEN LOGIC
   ========================================= */
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");

  if (loadingScreen) {
    // Artificial minimum delay so the rapid page load doesn't skip the cool animation
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 1200); // 1.2s to watch the heartbeat and progress bar
  }
});