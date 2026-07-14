const nextStopButtons = document.querySelectorAll(
  ".js-next-stop"
);

const stopTransition = document.getElementById(
  "stopTransition"
);

const stopTransitionKicker = document.getElementById(
  "stopTransitionKicker"
);

const stopTransitionFrom = document.getElementById(
  "stopTransitionFrom"
);

const stopTransitionTo = document.getElementById(
  "stopTransitionTo"
);

const stopTransitionTitle = document.getElementById(
  "stopTransitionTitle"
);

const miniPlane = document.getElementById("miniPlane");

const miniArcPath = document.getElementById("miniArcPath");

const miniArcViewBox = {
  width: 200,
  height: 50,
};

let isStopTransitionRunning = false;
const miniFlightDuration = 1350;
const stopTransitionDuration = 3200;

function resetMiniStopsState() {
  if (stopTransitionFrom) {
    stopTransitionFrom.classList.remove("is-origin", "is-arrived");
  }

  if (stopTransitionTo) {
    stopTransitionTo.classList.remove("is-origin", "is-arrived");
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getMiniFrame(progress) {
  const totalLength = miniArcPath.getTotalLength();
  const targetLength = clamp(progress, 0, 1) * totalLength;
  const currentPoint = miniArcPath.getPointAtLength(targetLength);
  const nextPoint = miniArcPath.getPointAtLength(
    Math.min(totalLength, targetLength + Math.max(3, totalLength * 0.01))
  );

  const angle = Math.atan2(
    nextPoint.y - currentPoint.y,
    nextPoint.x - currentPoint.x
  ) * 180 / Math.PI;

  return { currentPoint, angle };
}

function applyMiniFrame(progress) {
  if (!miniPlane || !miniArcPath) return;

  const { currentPoint, angle } = getMiniFrame(progress);

  miniPlane.style.offsetPath = "none";
  miniPlane.style.offsetDistance = "0%";
  miniPlane.style.transition = "none";
  miniPlane.style.left = `${(currentPoint.x / miniArcViewBox.width) * 100}%`;
  miniPlane.style.top = `${(currentPoint.y / miniArcViewBox.height) * 100}%`;
  miniPlane.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

function animateMiniPlane() {
  if (!miniPlane) return;

  miniPlane.style.offsetPath = "none";
  miniPlane.style.offsetDistance = "0%";
  miniPlane.style.transition = "none";

  const startTime = window.performance.now();

  const step = (now) => {
    const elapsed = clamp((now - startTime) / miniFlightDuration, 0, 1);
    const progress = easeInOutCubic(elapsed);

    applyMiniFrame(progress);

    if (elapsed < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

if (nextStopButtons.length && stopTransition) {
  nextStopButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      if (isStopTransitionRunning) {
        return;
      }

      isStopTransitionRunning = true;

      const nextTarget =
        this.dataset.next || this.getAttribute("href");

      if (stopTransitionKicker) {
        stopTransitionKicker.textContent =
          this.dataset.transitionKicker ||
          "Siguiente destino";
      }

      if (stopTransitionFrom) {
        stopTransitionFrom.textContent =
          this.dataset.transitionFrom || "";
      }

      if (stopTransitionTo) {
        stopTransitionTo.textContent =
          this.dataset.transitionTo || "";
      }

      if (stopTransitionTitle) {
        stopTransitionTitle.textContent =
          this.dataset.transitionTitle ||
          "Continuamos el viaje";
      }

      resetMiniStopsState();
      stopTransitionFrom?.classList.add("is-origin");

      applyMiniFrame(0);

      stopTransition.classList.add("is-active");
      animateMiniPlane();

      window.setTimeout(() => {
        stopTransitionTo?.classList.add("is-arrived");
      }, miniFlightDuration);

      window.setTimeout(() => {
        stopTransition.classList.remove("is-active");
        isStopTransitionRunning = false;
        resetMiniStopsState();

        if (typeof window.appNavigateTo === "function") {
          window.appNavigateTo(nextTarget);
          return;
        }

        window.location.href = nextTarget;
      }, stopTransitionDuration);
    });
  });
}
