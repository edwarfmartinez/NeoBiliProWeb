(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyB_c6lVAGx_nZpGTFQEhWY1JbgJxRBlxV8",
    authDomain: "neobili-pro.firebaseapp.com",
    projectId: "neobili-pro",
    storageBucket: "neobili-pro.firebasestorage.app",
    messagingSenderId: "1008285189914",
    appId: "1:1008285189914:web:e641c332a2db90c0970ea3",
    measurementId: "G-05F34150RG",
  };

  let sendAnalyticsEvent = null;
  const pendingAnalyticsEvents = [];

  const cleanAnalyticsParams = (detail) =>
    Object.fromEntries(
      Object.entries(detail).filter(([, value]) => value !== undefined && value !== null),
    );

  const track = (eventName, detail = {}) => {
    const params = cleanAnalyticsParams(detail);

    if (sendAnalyticsEvent) {
      sendAnalyticsEvent(eventName, params);
      return;
    }

    pendingAnalyticsEvents.push({ eventName, params });
  };

  const initializeFirebaseAnalytics = async () => {
    try {
      const [{ initializeApp }, { getAnalytics, isSupported, logEvent }] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js"),
      ]);

      if (!(await isSupported())) return;

      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      sendAnalyticsEvent = (eventName, params) => logEvent(analytics, eventName, params);

      pendingAnalyticsEvents.splice(0).forEach(({ eventName, params }) => {
        sendAnalyticsEvent(eventName, params);
      });
    } catch (error) {
      console.warn("Firebase Analytics could not be initialized.", error);
    }
  };

  void initializeFirebaseAnalytics();

  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      mobileMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  document.querySelectorAll("[data-app-store]").forEach((link) => {
    link.addEventListener("click", () => {
      track("app_store_click", {
        source_page: document.body.dataset.page || "unknown",
        section: link.dataset.section || "unknown",
        cta_position: link.dataset.position || "unknown",
        resource_topic: link.dataset.resource || undefined,
      });
    });
  });

  document.querySelectorAll("[data-resource-link]").forEach((link) => {
    link.addEventListener("click", () => {
      track("clinical_resource_view", {
        source_page: document.body.dataset.page || "unknown",
        resource_topic: link.dataset.topic || link.textContent.trim(),
      });
    });
  });

  document.querySelectorAll("[data-guideline-source]").forEach((link) => {
    link.addEventListener("click", () => {
      track("guideline_source_click", {
        source_page: document.body.dataset.page || "unknown",
        guideline: link.dataset.guideline || "unknown",
      });
    });
  });

  document.querySelectorAll("details[data-faq]").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        track("faq_open", {
          source_page: document.body.dataset.page || "unknown",
          question: item.querySelector("summary")?.textContent.trim(),
        });
      }
    });
  });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
