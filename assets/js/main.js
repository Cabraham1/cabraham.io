(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const year = document.querySelector("#year");

  if (year) year.textContent = String(new Date().getFullYear());

  const setNav = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    const label = toggle.querySelector(".sr-only");
    if (label) label.textContent = open ? "Close menu" : "Open menu";
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if ((link.getAttribute("href") || "").startsWith("#")) setNav(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNav(false);
    });
  }

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = nav
    ? Array.from(nav.querySelectorAll('a[href^="#"]:not(.nav-resume)'))
    : [];

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);

    const marker = window.scrollY + 160;
    let current = null;
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section;
    });

    navLinks.forEach((link) => {
      const active = current && link.getAttribute("href") === `#${current.id}`;
      link.classList.toggle("is-active", Boolean(active));
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  const form = document.querySelector(".contact-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!button || !status) return;

    button.disabled = true;
    status.className = "form-status";
    status.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        status.textContent = "Message sent. I will get back to you soon.";
        status.classList.add("is-success");
      } else {
        status.textContent = "That did not go through. Please email me directly.";
        status.classList.add("is-error");
      }
    } catch (error) {
      status.textContent = "Network error. Please email me directly.";
      status.classList.add("is-error");
    } finally {
      button.disabled = false;
    }
  });
})();
