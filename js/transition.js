(() => {
  const startJourneyButton =
    document.querySelector(".js-start-journey");

  const journeyTransition =
    document.getElementById("journeyTransition");

  const flyingPlane =
    document.getElementById("flyingPlane");

  const storyPolaroid =
    document.getElementById("storyPolaroid");

  const storyPhoto =
    document.getElementById("storyPhoto");

  const storyCaption =
    document.getElementById("storyCaption");

  const storyText =
    document.getElementById("storyText");

  const soundtrack =
    document.getElementById("weddingSoundtrack");

  const mainRoutePath =
    document.getElementById("routePathTrail");

  const mainRouteViewBox = {
    width: 720,
    height: 120,
  };

  let isJourneyRunning = false;

  let mainPlaneProgress = 0;

  const storyStops = [
    {
      image: "images/transition/filomena.jpg",
      caption: "Fuenlabrada",
      text: "Donde los planes dejaron de ser ideas para convertirse en un futuro juntos.",
      rotate: "-5deg",
      planePosition: 0,
    },
    {
      image: "images/transition/delphi.jpg",
      caption: "Irlanda",
      text: "Donde descubrimos que el hogar también podía estar lejos.",
      rotate: "4deg",
      planePosition: 0.5,
    },
    {
      image: "images/transition/hawaianas.jpg",
      caption: "Madridejos",
      text: "Donde nació nuestro sueño compartido y donde comienza la aventura más importante de todas.",
      rotate: "-3deg",
      planePosition: 1,
    },
  ];

    /*
    Precarga las imágenes para que estén listas
    antes de que empiece la transición.
  */
  storyStops.forEach((stop) => {
    const image = new Image();
    image.src = stop.image;
  });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function getPathFrame(pathEl, progress) {
    const totalLength = pathEl.getTotalLength();
    const targetLength = clamp(progress, 0, 1) * totalLength;
    const currentPoint = pathEl.getPointAtLength(targetLength);
    const nextPoint = pathEl.getPointAtLength(
      Math.min(totalLength, targetLength + Math.max(4, totalLength * 0.005))
    );

    const angle = Math.atan2(
      nextPoint.y - currentPoint.y,
      nextPoint.x - currentPoint.x
    ) * 180 / Math.PI;

    return { currentPoint, angle };
  }

  function applyPlaneFrame(planeEl, pathEl, progress, viewBoxWidth, viewBoxHeight) {
    if (!planeEl || !pathEl) return;

    const { currentPoint, angle } = getPathFrame(pathEl, progress);

    planeEl.style.offsetPath = "none";
    planeEl.style.offsetDistance = "0%";
    planeEl.style.transition = "none";
    planeEl.style.left = `${(currentPoint.x / viewBoxWidth) * 100}%`;
    planeEl.style.top = `${(currentPoint.y / viewBoxHeight) * 100}%`;
    planeEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  function animatePlaneFrame(planeEl, pathEl, fromProgress, toProgress, duration, viewBoxWidth, viewBoxHeight) {
    if (!planeEl || !pathEl) return Promise.resolve();

    planeEl.style.offsetPath = "none";
    planeEl.style.offsetDistance = "0%";
    planeEl.style.transition = "none";

    const startTime = window.performance.now();

    return new Promise((resolve) => {
      function step(now) {
        const elapsed = clamp((now - startTime) / duration, 0, 1);
        const eased = easeInOutCubic(elapsed);
        const progress = fromProgress + (toProgress - fromProgress) * eased;

        applyPlaneFrame(planeEl, pathEl, progress, viewBoxWidth, viewBoxHeight);

        if (elapsed < 1) {
          window.requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      window.requestAnimationFrame(step);
    });
  }

  function wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function fadeInAudio(
    audio,
    targetVolume = 0.38,
    duration = 4000
  ) {
    if (!audio) return;

    audio.volume = 0;

    const steps = 40;
    const intervalTime = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = window.setInterval(() => {
      currentStep += 1;

      audio.volume = Math.min(
        volumeStep * currentStep,
        targetVolume
      );

      if (currentStep >= steps) {
        window.clearInterval(fadeInterval);
      }
    }, intervalTime);
  }

 function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

async function showPhoto(stop) {
  /*
    Primero dejamos la polaroid totalmente oculta.
  */
  storyPolaroid.classList.remove(
    "is-visible",
    "is-leaving"
  );

  /*
    Esperamos a que la imagen nueva esté cargada
    antes de sustituir la anterior.
  */
  try {
    await loadImage(stop.image);
  } catch (error) {
    console.error(
      `No se pudo cargar la imagen: ${stop.image}`,
      error
    );

    return;
  }

  storyPhoto.src = stop.image;
  storyPhoto.alt = `Recuerdo de ${stop.caption}`;

  storyCaption.textContent = stop.caption;
  storyText.textContent = stop.text;

  storyPolaroid.style.setProperty(
    "--story-rotate",
    stop.rotate
  );

  /*
    Forzamos al navegador a registrar el estado oculto.
  */
  void storyPolaroid.offsetWidth;

  storyPolaroid.classList.add("is-visible");
}

async function hidePhoto() {
  storyPolaroid.classList.remove("is-visible");
  storyPolaroid.classList.add("is-leaving");

  await wait(700);

  storyPolaroid.classList.remove("is-leaving");

  /*
    Evitamos que quede visible la imagen anterior
    mientras se prepara la siguiente.
  */
  storyPhoto.removeAttribute("src");
}

function resetJourneyState() {
  journeyTransition.classList.remove("is-active");
  startJourneyButton.classList.remove("is-clicked");

  if (flyingPlane && mainRoutePath) {
    mainPlaneProgress = 0;
    applyPlaneFrame(
      flyingPlane,
      mainRoutePath,
      0,
      mainRouteViewBox.width,
      mainRouteViewBox.height
    );
  }

  document.querySelectorAll(".map-stop").forEach((s) => {
    s.classList.remove("is-active");
  });

  if (mainRoutePath) {
    const len = mainRoutePath.getTotalLength();
    mainRoutePath.style.strokeDashoffset = len;
  }

  if (storyPolaroid) {
    storyPolaroid.classList.remove("is-visible", "is-leaving");
  }
}

  async function playJourney(nextPage) {
    journeyTransition.classList.add("is-active");

    await wait(700);

    // Calcular longitud real del path para la estela
    const totalLength = mainRoutePath.getTotalLength();

    if (mainRoutePath) {
      mainRoutePath.style.strokeDasharray = "4 6";
      mainRoutePath.style.strokeDashoffset = totalLength;
    }

    const stops = document.querySelectorAll(".map-stop");

    // ── Parada 0: Fuenlabrada ──
    applyPlaneFrame(
      flyingPlane,
      mainRoutePath,
      storyStops[0].planePosition,
      mainRouteViewBox.width,
      mainRouteViewBox.height
    );
    mainPlaneProgress = storyStops[0].planePosition;
    stops[0]?.classList.add("is-active");

    await showPhoto(storyStops[0]);
    await wait(4500);
    await hidePhoto();

    // Volar hacia parada 1 + dibujar primera mitad de estela
    if (mainRoutePath) mainRoutePath.style.strokeDashoffset = totalLength / 2;
    animatePlaneFrame(
      flyingPlane,
      mainRoutePath,
      mainPlaneProgress,
      storyStops[1].planePosition,
      2200,
      mainRouteViewBox.width,
      mainRouteViewBox.height
    );
    mainPlaneProgress = storyStops[1].planePosition;

    await wait(2800);
    stops[1]?.classList.add("is-active");

    await showPhoto(storyStops[1]);
    await wait(4500);
    await hidePhoto();

    // Volar hacia parada 2 + completar estela
    if (mainRoutePath) mainRoutePath.style.strokeDashoffset = 0;
    animatePlaneFrame(
      flyingPlane,
      mainRoutePath,
      mainPlaneProgress,
      storyStops[2].planePosition,
      2200,
      mainRouteViewBox.width,
      mainRouteViewBox.height
    );
    mainPlaneProgress = storyStops[2].planePosition;

    await wait(2800);
    stops[2]?.classList.add("is-active");

    await showPhoto(storyStops[2]);
    await wait(4400);
    await hidePhoto();

    await wait(1800);

    // Primero navegamos a la siguiente pantalla
    if (typeof window.appNavigateTo === "function") {
      window.appNavigateTo(nextPage);
    } else {
      window.location.href = nextPage;
    }

    // Luego limpiamos el overlay
    await wait(500);
    resetJourneyState();
  }

  if (
  startJourneyButton &&
  journeyTransition &&
  flyingPlane &&
  storyPolaroid
) {
  startJourneyButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (isJourneyRunning) {
      return;
    }

    isJourneyRunning = true;

    const nextPage =
      startJourneyButton.getAttribute("href") || "#vispera";

    /*
      Debe ejecutarse directamente dentro del clic.
      No debe haber ningún await ni setTimeout antes de play().
    */
    if (soundtrack) {
      soundtrack.volume = 0;

      const playPromise = soundtrack.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            fadeInAudio(soundtrack, 0.38, 4000);
          })
          .catch((error) => {
            console.error(
              "No se pudo iniciar la música:",
              error
            );
          });
      }
    }

    startJourneyButton.classList.add("is-clicked");
    startJourneyButton.style.pointerEvents = "none";

    window.setTimeout(() => {
      playJourney(nextPage).finally(() => {
        isJourneyRunning = false;
        startJourneyButton.style.pointerEvents = "";
      });
    }, 450);
  });
}
  
})();
