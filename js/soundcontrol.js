(() => {
  const soundtrack = document.getElementById("weddingSoundtrack");
  if (!soundtrack) return;

  /*
    Como ahora todo vive en una sola página, el audio nunca se
    destruye entre secciones: basta con recordar en memoria si
    estaba sonando antes de perder el foco, sin sessionStorage.
  */
  let wasPlayingBeforeHidden = false;

  function resumeOnFirstInteraction() {
    soundtrack.play().catch(() => {});
  }

  function pauseTrack() {
    if (!soundtrack.paused) {
      wasPlayingBeforeHidden = true;
      soundtrack.pause();
    }
  }

  function resumeTrack() {
    if (wasPlayingBeforeHidden && soundtrack.paused) {
      soundtrack.play().catch(() => {
        ["click", "touchend"].forEach((eventName) => {
          document.addEventListener(
            eventName,
            resumeOnFirstInteraction,
            { once: true }
          );
        });
      });
    }
  }

  // Pausar cuando cambias a otra pestaña, reanudar al volver.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseTrack();
    } else {
      resumeTrack();
    }
  });

  // Pausar cuando pierdes el foco de la ventana (alt+tab, etc.).
  window.addEventListener("blur", pauseTrack);
  window.addEventListener("focus", resumeTrack);
})();
