// Select DOM elements
const domElements = {
  form: document.getElementById("timerForm"),
  timerDisplay: document.getElementById("timerDisplay"),
  phaseTitle: document.getElementById("phaseTitle"),
  timerElement: document.getElementById("timer"),
  stopButton: document.getElementById("stopButton"),
  beepSound: document.getElementById("beepSound"),
  beepEndSound: document.getElementById("beepEndSound"),
  favoritesBloc: document.getElementById("favorites"),
  favoritesList: document.getElementById("favoritesList"),
  saveFavoriteButton: document.getElementById("saveFavoriteButton"),
};

// Handle favorites
const favoritesManager = {
  favorites: JSON.parse(localStorage.getItem("favorites")) || [],

  save(favorite) {
    this.favorites.push(favorite);
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
    this.render();
  },

  render() {
    domElements.favoritesList.innerHTML = "";

    if (this.favorites.length > 0) {
      domElements.favoritesBloc.classList.remove("hidden");

      this.favorites.forEach((favorite, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          Activité: ${favorite.activityTime}s, 
          Repos: ${favorite.restTime}s, 
          Session: ${favorite.sessionDuration}min </br>
          <button class="load-button">Utiliser</button>
          <button class="delete-button">Supprimer</button>
        `;

        listItem
          .querySelector(".load-button")
          .addEventListener("click", () => this.load(index));
        listItem
          .querySelector(".delete-button")
          .addEventListener("click", () => this.delete(index));

        listItem.classList.add("favorite-item");

        domElements.favoritesList.appendChild(listItem);
      });
    } else {
      domElements.favoritesBloc.classList.add("hidden");
    }
  },

  load(index) {
    const favorite = this.favorites[index];

    document.getElementById("activityTime").value = favorite.activityTime;
    document.getElementById("restTime").value = favorite.restTime;
    document.getElementById("sessionDuration").value = favorite.sessionDuration;

    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    domElements.form.dispatchEvent(submitEvent);
  },

  delete(index) {
    this.favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
    this.render();
  },
};

// Utils
const utils = {
  parseInput(inputId) {
    const input = document.getElementById(inputId);
    const value = parseInt(input.value, 10);

    if (isNaN(value) || value < 1) {
      input.setCustomValidity("Valeur invalide");
      input.reportValidity();
      throw new Error(`Invalid input for ${inputId}`);
    }

    return value;
  },

  updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    domElements.timerElement.textContent = `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  },

  playSound(audioElement) {
    audioElement.currentTime = 0;
    audioElement
      .play()
      .catch((error) => console.error("Audio play failed:", error));
  },
};

// Handle timer
function startTimer() {
  const activityTime = utils.parseInput("activityTime");
  const restTime = utils.parseInput("restTime");
  const sessionDuration = utils.parseInput("sessionDuration");

  const totalTime = sessionDuration * 60;
  let elapsedTime = 0;
  let isActivityPhase = true;
  let remainingTime = activityTime;

  // Hide form and display timer
  domElements.form.classList.add("hidden");
  domElements.favoritesBloc.classList.add("hidden");
  domElements.timerDisplay.classList.remove("hidden");

  // Initial config
  domElements.phaseTitle.textContent = "Phase: Activité";
  utils.updateTimerDisplay(remainingTime);
  utils.playSound(domElements.beepSound);

  const intervalId = setInterval(() => {
    remainingTime--;
    elapsedTime++;

    // Phase transition
    if (remainingTime <= 0) {
      isActivityPhase = !isActivityPhase;
      domElements.phaseTitle.textContent = `Phase: ${
        isActivityPhase ? "Activité" : "Repos"
      }`;
      remainingTime = isActivityPhase ? activityTime : restTime;
      utils.playSound(domElements.beepSound);
    }

    utils.updateTimerDisplay(remainingTime);

    // End of session
    if (elapsedTime >= totalTime) {
      endSession(intervalId);
    }
  }, 1000);
}

function endSession(intervalId) {
  clearInterval(intervalId);
  utils.playSound(domElements.beepEndSound);
  domElements.phaseTitle.textContent = "Session terminée !";

  setTimeout(() => {
    resetUI();
  }, 2000);
}

function resetUI() {
  domElements.form.reset();
  domElements.form.classList.remove("hidden");
  domElements.timerDisplay.classList.add("hidden");

  if (favoritesManager.favorites.length > 0) {
    domElements.favoritesBloc.classList.remove("hidden");
  }
}

// Events listener
domElements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  startTimer();
});

domElements.stopButton.addEventListener("click", () => {
  const activeInterval = setInterval(() => {}, 1); // Get the last interval
  endSession(activeInterval);
});

domElements.saveFavoriteButton.addEventListener("click", () => {
  try {
    const favorite = {
      activityTime: utils.parseInput("activityTime"),
      restTime: utils.parseInput("restTime"),
      sessionDuration: utils.parseInput("sessionDuration"),
    };

    favoritesManager.save(favorite);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du favori:", error);
  }
});

// Init favorites
document.addEventListener("DOMContentLoaded", () => {
  favoritesManager.render();
});
