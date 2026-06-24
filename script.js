/* Raízes de Taquarana — interactions (v2) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsIO = "IntersectionObserver" in window;

  /* ---- Nav: scrolled state + mobile toggle ---- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Reveal on scroll (enhancement; content visible without JS) ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function showAll() { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  if (reduce || !supportsIO) {
    showAll();
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = Array.prototype.slice.call(
          e.target.parentNode.querySelectorAll(":scope > .reveal")
        );
        var idx = sibs.indexOf(e.target);
        e.target.style.transitionDelay = Math.min(idx, 6) * 70 + "ms";
        e.target.classList.add("in");
        ro.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
    /* safety net: never leave content hidden */
    setTimeout(showAll, 4000);
  }

  /* ---- Animated number counters ---- */
  function fmt(v, dec) {
    return (dec > 0 ? v.toFixed(dec) : Math.round(v).toString()).replace(".", ",");
  }
  function runCount(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = fmt(to, dec) + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)), dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to, dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  if (!supportsIO) {
    counters.forEach(runCount);
  } else {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- IDHM columns grow ---- */
  var cols = Array.prototype.slice.call(document.querySelectorAll(".idhm-plot .col"));
  if (cols.length) {
    if (!supportsIO) {
      cols.forEach(function (c) { c.classList.add("in"); });
    } else {
      var bo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          cols.forEach(function (c, i) { setTimeout(function () { c.classList.add("in"); }, i * 150); });
          bo.disconnect();
        });
      }, { threshold: 0.4 });
      bo.observe(cols[0].parentNode);
    }
  }

  /* ---- Taquara draws on load ---- */
  var scene = document.querySelector(".taquara-scene");
  if (scene) {
    requestAnimationFrame(function () {
      setTimeout(function () { scene.classList.add("taquara-go"); }, 200);
    });
  }

  /* ---- Active section in nav ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (sections.length && supportsIO) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = "#" + e.target.id;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { so.observe(s); });
  }
})();
