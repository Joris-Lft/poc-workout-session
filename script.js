const form = document.getElementById("timerForm");
const timerDisplay = document.getElementById("timerDisplay");
const phaseTitle = document.getElementById("phaseTitle");
const timerElement = document.getElementById("timer");
const stopButton = document.getElementById("stopButton");
const beepSound = document.getElementById("beepSound");
const beepEndSound = document.getElementById("beepEndSound");
const favoritesBloc = document.getElementById("favorites");
const favoritesList = document.getElementById("favoritesList");
const saveFavoriteButton = document.getElementById("saveFavoriteButton");

let intervalId = null;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const activityTime = parseInt(
    document.getElementById("activityTime").value,
    10
  );
  const restTime = parseInt(document.getElementById("restTime").value, 10);
  const sessionDuration = parseInt(
    document.getElementById("sessionDuration").value,
    10
  );

  const totalTime = sessionDuration * 60; // Convert to seconds
  let elapsedTime = 0;
  let isActivityPhase = true;
  let remainingTime = activityTime;

  form.classList.add("hidden");
  favoritesBloc.classList.add("hidden");
  timerDisplay.classList.remove("hidden");

  phaseTitle.textContent = "Phase: Activité";
  updateTimerDisplay(remainingTime);
  beepSound.play();

  intervalId = setInterval(() => {
    remainingTime--;
    elapsedTime++;

    if (remainingTime <= 0) {
      beepSound.currentTime = 0; // Reset sound to the start
      beepSound.play();

      isActivityPhase = !isActivityPhase;
      phaseTitle.textContent = `Phase: ${
        isActivityPhase ? "Activité" : "Repos"
      }`;
      remainingTime = isActivityPhase ? activityTime : restTime;
    }

    updateTimerDisplay(remainingTime);

    if (elapsedTime >= totalTime) {
      beepEndSound.play();
      clearInterval(intervalId);
      endSession();
    }
  }, 1000);
});

stopButton.addEventListener("click", () => {
  clearInterval(intervalId);
  endSession();
});

function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function endSession() {
  phaseTitle.textContent = "Session terminée !";
  setTimeout(() => {
    // Reset UI
    form.reset();
    form.classList.remove("hidden");
    timerDisplay.classList.add("hidden");
    if (favorites.length > 0) {
      favoritesBloc.classList.remove("hidden");
    }
  }, 2000); // Wait 2 seconds before resetting
}

/**
 * Favorites
 */
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveFavorite() {
  const activityTime = parseInt(activityTime.valueOf, 10);
  const restTime = parseInt(restTime.valueOf, 10);
  const sessionDuration = parseInt(sessionDuration.valueOf, 10);

  const favorite = { activityTime, restTime, sessionDuration };
  favorites.push(favorite);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  renderFavorites();
}

function renderFavorites() {
  favoritesList.innerHTML = ""; // Clear existing list

  if (favorites.length > 0) {
    favoritesBloc.classList.remove("hidden");

    favorites.forEach((favorite, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Activité: ${favorite.activityTime}s, Repos: ${favorite.restTime}s, Session: ${favorite.sessionDuration}min`;
      listItem.classList.add("favorite-item");

      const loadButton = document.createElement("button");
      loadButton.textContent = "Utiliser";
      loadButton.classList.add("load-button");
      loadButton.addEventListener("click", () => loadFavorite(index));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Supprimer";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => deleteFavorite(index));

      listItem.appendChild(loadButton);
      listItem.appendChild(deleteButton);
      favoritesList.appendChild(listItem);
    });
  } else {
    favoritesBloc.classList.add("hidden");
  }
}

function loadFavorite(index) {
  const favorite = favorites[index];
  document.getElementById("activityTime").value = favorite.activityTime;
  document.getElementById("restTime").value = favorite.restTime;
  document.getElementById("sessionDuration").value = favorite.sessionDuration;

  // launch session
  const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);
}

function deleteFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Event listener for saving a favorite
saveFavoriteButton.addEventListener("click", saveFavorite);

// Initialize favorites on page load
document.addEventListener("DOMContentLoaded", renderFavorites);
