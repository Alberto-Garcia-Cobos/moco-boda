(() => {
  const screens = Array.from(
    document.querySelectorAll("[data-screen]")
  );

  const screenNames = new Set(
    screens.map((screen) => screen.dataset.screen)
  );

  function normalizeTarget(target) {
    if (!target) return null;

    if (target.startsWith("#")) {
      return target.slice(1);
    }

    const fileName = target.split("/").pop() || "";
    const map = {
      "index.html": "home",
      "vispera.html": "vispera",
      "ceremonia.html": "ceremonia",
      "banquete.html": "banquete",
      "rsvp.html": "rsvp",
    };

    return map[fileName] || null;
  }

  function setActiveScreen(name, updateHash = true) {
    if (!screenNames.has(name)) return;

    screens.forEach((screen) => {
      const isActive = screen.dataset.screen === name;
      // Usamos clase en vez del atributo hidden para evitar que
      // las reglas CSS de display:grid/flex lo anulen.
      screen.classList.toggle("is-hidden", !isActive);
      screen.classList.toggle("is-active", isActive);
    });

    window.scrollTo(0, 0);

    if (updateHash) {
      const nextHash = name === "home" ? "" : `#${name}`;
      if (window.location.hash !== nextHash) {
        if (nextHash) {
          history.replaceState(null, "", nextHash);
        } else {
          const cleanUrl = `${window.location.pathname}${window.location.search}`;
          history.replaceState(null, "", cleanUrl);
        }
      }
    }
  }

  function navigateTo(target, updateHash = true) {
    const name = normalizeTarget(target);
    if (!name) return;
    setActiveScreen(name, updateHash);
  }

  window.appNavigateTo = (target) => {
    navigateTo(target, true);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    if (
      link.classList.contains("js-start-journey") ||
      link.classList.contains("js-next-stop")
    ) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href) return;

    const name = normalizeTarget(href);
    if (!name) return;

    event.preventDefault();
    navigateTo(href, true);
  });

  window.addEventListener("hashchange", () => {
    if (!window.location.hash) {
      navigateTo("#home", false);
      return;
    }
    navigateTo(window.location.hash, false);
  });

  // Ocultar todas las pantallas excepto la activa al cargar.
  if (window.location.hash) {
    navigateTo(window.location.hash, false);
  } else {
    navigateTo("#home", false);
  }
})();
