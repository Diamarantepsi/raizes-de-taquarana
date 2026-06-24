/* Raízes de Taquarana — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: scrolled state + mobile toggle + active link ---- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");

  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
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

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var sibs = Array.prototype.slice.call(
            e.target.parentNode.querySelectorAll(":scope > .reveal")
          );
          var idx = sibs.indexOf(e.target);
          e.target.style.transitionDelay = Math.min(idx, 6) * 70 + "ms";
          e.target.classList.add("in");
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ---- Animated number counters ---- */
  function formatNum(v, dec) {
    var s = dec > 0 ? v.toFixed(dec) : Math.round(v).toString();
    return s.replace(".", ",");
  }
  function runCount(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = formatNum(to, dec) + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(to * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(to, dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".count");
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (el) { co.observe(el); });

  /* ---- IDHM bars grow ---- */
  var bars = document.querySelectorAll(".idhm-chart .bar");
  var bo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        bars.forEach(function (b, i) {
          setTimeout(function () { b.classList.add("in"); }, i * 160);
        });
        bo.disconnect();
      }
    });
  }, { threshold: 0.4 });
  if (bars.length) bo.observe(bars[0].parentNode);

  /* ---- Taquara grows on load ---- */
  var scene = document.querySelector(".taquara-scene");
  if (scene) {
    if (reduce) scene.classList.add("go");
    else requestAnimationFrame(function () {
      setTimeout(function () { scene.classList.add("go"); }, 220);
    });
  }

  /* ---- Active section in nav ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = "#" + e.target.id;
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { so.observe(s); });
  }
})();
