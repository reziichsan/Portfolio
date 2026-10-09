/**
 * Portfolio of Rezi Ichsan Nur Arsyi - interactions
 *
 * Sections:
 *  1. Helpers
 *  2. Starfield background
 *  3. Scroll effects (progress bar, parallax, zoom)
 *  4. Reveal animation and counters
 *  5. Active section highlighting
 *  6. Mobile menu and back-to-top button
 *  7. Project filter and card tilt
 *  8. Lightbox
 *  9. Role typewriter, clock and year
 */
(() => {
  "use strict";

  // Lets the CSS hide .reveal elements only when this script is running.
  document.documentElement.classList.add("js");

  /* ---------- 1. Helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- 2. Starfield background ---------- */

  function createStarfield(count = 70) {
    const starfield = $("#starfield");

    for (let i = 0; i < count; i++) {
      const star = document.createElement("i");
      const size = Math.random() * 2 + 1;

      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${Math.random() * 0.7 + 0.2};
        animation-delay: ${-Math.random() * 3}s;
      `;
      starfield.appendChild(star);
    }
  }

  /* ---------- 3. Scroll effects ---------- */

  const progressBar = $("#progress-bar");
  const navbar = $("#navbar");
  const backToTop = $("#back-to-top");
  const heroContent = $("#hero-content");
  const heroLayers = $$(".layer");
  const zoomBlocks = $$(".zoom");
  const floatingIcons = $$(".floating-icon");

  let scrollQueued = false;

  function updateOnScroll() {
    scrollQueued = false;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const maxScroll =
      document.documentElement.scrollHeight - viewportHeight;

    progressBar.style.width = `${(scrollY / maxScroll) * 100}%`;
    navbar.classList.toggle("scrolled", scrollY > 40);
    backToTop.classList.toggle("show", scrollY > 500);

    if (prefersReducedMotion) return;

    // Hero: every layer moves at its own speed, the title zooms in and fades.
    const heroProgress = clamp(scrollY / viewportHeight, 0, 1.4);

    heroLayers.forEach((layer) => {
      const speed = Number(layer.dataset.speed);
      layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0) scale(${
        1 + heroProgress * speed * 0.5
      })`;
    });

    heroContent.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0) scale(${
      1 + heroProgress * 0.28
    })`;
    heroContent.style.opacity = clamp(1 - heroProgress * 1.15, 0, 1);

    // Levels: shrink and fade slightly the further they are from screen center.
    zoomBlocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      const blockCenter = rect.top + rect.height / 2;
      const distance = clamp(
        Math.abs(blockCenter - viewportHeight / 2) / viewportHeight,
        0,
        1
      );

      block.style.transform = `scale(${1 - distance * 0.1})`;
      block.style.opacity = 1 - distance * 0.5;
    });

    // Decorative icons drift relative to their section.
    floatingIcons.forEach((icon) => {
      const sectionTop = icon.parentElement.getBoundingClientRect().top;
      const offset = viewportHeight / 2 - sectionTop;

      icon.style.transform = `translate3d(0, ${
        offset * icon.dataset.speed
      }px, 0) rotate(${offset * 0.03}deg)`;
    });
  }

  function requestScrollUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateOnScroll);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", updateOnScroll);

  /* ---------- 4. Reveal animation and counters ---------- */

  function animateCounter(element) {
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals) || 0;
    const suffix = element.dataset.suffix || "";
    const duration = 1100;
    const startTime = performance.now();

    if (prefersReducedMotion) {
      element.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    function step(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;

      element.textContent =
        (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function setupReveal() {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          const counter = $("[data-count]", entry.target);
          if (counter) animateCounter(counter);

          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    $$(".reveal").forEach((element, index) => {
      element.style.transitionDelay = `${(index % 3) * 0.08}s`; // small stagger
      revealObserver.observe(element);
    });

    // Safety net: anything already on screen after load becomes visible.
    window.addEventListener("load", () => {
      setTimeout(() => {
        $$(".reveal").forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add("visible");
          }
        });
      }, 600);
    });
  }

  /* ---------- 5. Active section highlighting ---------- */

  function setupActiveSection() {
    const links = $$(".nav-links a, .map-nodes a");

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          links.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", isCurrent);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    $$("main section[id]").forEach((section) =>
      sectionObserver.observe(section)
    );
  }

  /* ---------- 6. Mobile menu and back-to-top button ---------- */

  function setupMobileMenu() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    const icon = $("i", toggle);

    function setMenu(isOpen) {
      menu.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      icon.className = isOpen ? "ri-close-line" : "ri-menu-3-line";
    }

    toggle.addEventListener("click", () =>
      setMenu(!menu.classList.contains("open"))
    );
    $$("a", menu).forEach((link) =>
      link.addEventListener("click", () => setMenu(false))
    );
  }

  function setupBackToTop() {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---------- 7. Project filter and card tilt ---------- */

  function setupProjectFilter() {
    const buttons = $$(".filter-bar button");
    const cards = $$(".project-card");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        buttons.forEach((item) =>
          item.classList.toggle("active", item === button)
        );

        cards.forEach((card) => {
          const categories = card.dataset.category.split(" ");
          const isHidden = filter !== "all" && !categories.includes(filter);
          card.classList.toggle("hidden", isHidden);
        });
      });
    });
  }

  function setupCardTilt() {
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (prefersReducedMotion || !canHover) return;

    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `rotateY(${x * 8}deg) rotateX(${
          -y * 8
        }deg) translateY(-6px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- 8. Lightbox ---------- */

  function setupLightbox() {
    const lightbox = $("#lightbox");
    const image = $("img", lightbox);
    const caption = $("p", lightbox);
    const closeButton = $("button", lightbox);
    let previousFocus = null;

    function open(source, text) {
      previousFocus = document.activeElement;
      image.src = source;
      image.alt = text;
      caption.textContent = text;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      closeButton.focus();
    }

    function close() {
      lightbox.classList.remove("open");
      image.src = "";
      document.body.style.overflow = "";
      if (previousFocus) previousFocus.focus();
    }

    $$("[data-lightbox]").forEach((item) => {
      item.tabIndex = 0;

      const openItem = (event) => {
        event.preventDefault();
        const source =
          item.getAttribute("href") || $("img", item).getAttribute("src");
        open(source, item.dataset.caption);
      };

      item.addEventListener("click", openItem);
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter") openItem(event);
      });
    });

    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("open")) {
        close();
      }
    });

    // Hide images that fail to load instead of showing a broken icon.
    window.addEventListener(
      "error",
      (event) => {
        const target = event.target;
        if (target.tagName === "IMG" && !lightbox.contains(target)) {
          target.style.visibility = "hidden";
        }
      },
      true
    );
  }

  /* ---------- 9. Role typewriter, clock and year ---------- */

  function setupTypewriter() {
    if (prefersReducedMotion) return;

    const element = $("#role-text");
    const roles = [
      "Informatics Graduate",
      "IT Support Candidate",
      "Python & Django Developer",
      "Machine Learning Researcher",
    ];

    let roleIndex = 0;
    let charCount = roles[0].length;
    let isDeleting = true;

    function type() {
      if (isDeleting) {
        charCount--;
        element.textContent = roles[roleIndex].slice(0, charCount);

        if (charCount <= 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(type, 280);
          return;
        }
      } else {
        charCount++;
        element.textContent = roles[roleIndex].slice(0, charCount);

        if (charCount >= roles[roleIndex].length) {
          isDeleting = true;
          setTimeout(type, 1700); // pause on the full role name
          return;
        }
      }

      setTimeout(type, isDeleting ? 32 : 50);
    }

    setTimeout(type, 1600);
  }

  function setupClock() {
    const clock = $("#clock");
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    function tick() {
      clock.textContent = formatter.format(new Date());
      setTimeout(tick, 1000);
    }

    tick();
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Start ---------- */

  createStarfield();
  setupReveal();
  setupActiveSection();
  setupMobileMenu();
  setupBackToTop();
  setupProjectFilter();
  setupCardTilt();
  setupLightbox();
  setupTypewriter();
  setupClock();
  updateOnScroll();
})();
