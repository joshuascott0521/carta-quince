"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function finishOpening() {
  const veil = document.querySelector(".opening-veil");
  if (!veil) return;

  const removeVeil = () => veil.classList.add("is-gone");
  if (reducedMotion.matches) {
    removeVeil();
    return;
  }

  veil.addEventListener("animationend", (event) => {
    if (event.animationName === "veil-away") removeVeil();
  });
  window.setTimeout(removeVeil, 2400);
}

function setupImageFallback() {
  const image = document.querySelector(".portrait-media img");
  if (!image) return;

  const showFallback = () =>
    image.closest(".portrait-media")?.classList.add("has-error");
  image.addEventListener("error", showFallback, { once: true });
  if (image.complete && image.naturalWidth === 0) showFallback();
}

function setupReveals() {
  const elements = [...document.querySelectorAll(".reveal")];
  if (!elements.length) return;

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -7%" },
  );

  elements.forEach((element) => observer.observe(element));
}

function setupPetals() {
  const field = document.querySelector("#petal-field");
  const hero = document.querySelector(".hero");
  if (!field || !hero || reducedMotion.matches) return;

  const petalSettings = [
    [10, 10, 16, -3, 42, 0.42],
    [24, 14, 21, -11, -54, 0.5],
    [41, 9, 18, -6, 48, 0.38],
    [59, 13, 20, -15, -40, 0.56],
    [73, 11, 17, -8, 58, 0.44],
    [86, 15, 22, -18, -62, 0.5],
    [95, 8, 19, -4, 34, 0.36],
  ];

  const fragment = document.createDocumentFragment();
  petalSettings.forEach(([left, size, duration, delay, drift, opacity]) => {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.setProperty("--petal-left", `${left}%`);
    petal.style.setProperty("--petal-size", `${size}px`);
    petal.style.setProperty("--petal-duration", `${duration}s`);
    petal.style.setProperty("--petal-delay", `${delay}s`);
    petal.style.setProperty("--petal-drift", `${drift}px`);
    petal.style.setProperty("--petal-opacity", opacity);
    fragment.append(petal);
  });
  field.append(fragment);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      field.classList.toggle("is-paused", !entry.isIntersecting);
    });
    observer.observe(hero);
  }
}

function setupParallax() {
  const hero = document.querySelector(".hero");
  const portrait = document.querySelector("[data-parallax]");
  if (!hero || !portrait || reducedMotion.matches) return;

  const precisePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );
  if (!precisePointer.matches) return;

  let frame = 0;
  let targetX = 0;
  let targetY = 0;

  const render = () => {
    portrait.style.setProperty("--parallax-x", `${targetX.toFixed(2)}px`);
    portrait.style.setProperty("--parallax-y", `${targetY.toFixed(2)}px`);
    frame = 0;
  };

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetX = normalizedX * 8;
    targetY = normalizedY * 6;
    if (!frame) frame = window.requestAnimationFrame(render);
  });

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    if (!frame) frame = window.requestAnimationFrame(render);
  });
}

function setupCountdown() {
  const countdown = document.querySelector("#countdown");
  const finished = document.querySelector("#countdown-finished");
  if (!countdown || !finished) return;

  const eventDate = new Date("2026-10-03T21:00:00-05:00").getTime();
  const fields = {
    days: countdown.querySelector('[data-count="days"]'),
    hours: countdown.querySelector('[data-count="hours"]'),
    minutes: countdown.querySelector('[data-count="minutes"]'),
    seconds: countdown.querySelector('[data-count="seconds"]'),
  };

  let timer;
  const update = () => {
    const distance = eventDate - Date.now();
    if (distance <= 0) {
      window.clearInterval(timer);
      countdown.hidden = true;
      finished.hidden = false;
      return;
    }

    const day = 86_400_000;
    const hour = 3_600_000;
    const minute = 60_000;
    const values = {
      days: Math.floor(distance / day),
      hours: Math.floor((distance % day) / hour),
      minutes: Math.floor((distance % hour) / minute),
      seconds: Math.floor((distance % minute) / 1000),
    };

    Object.entries(values).forEach(([key, value]) => {
      if (!fields[key]) return;
      fields[key].textContent =
        key === "days" ? String(value) : String(value).padStart(2, "0");
    });
  };

  update();
  timer = window.setInterval(update, 1000);
}

function setupCalendarDownload() {
  const link = document.querySelector("#calendar-download");
  if (!link) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Invitacion XV//Valentina Sofia//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:xv-valentina-20270515@example.local",
      "DTSTAMP:20260912T190000Z",
      "DTSTART:20270515T233000Z",
      "DTEND:20270516T050000Z",
      "SUMMARY:Los XV de Valentina Sofia",
      "DESCRIPTION:Una noche para celebrar los quince anos de Valentina Sofia.",
      "LOCATION:Casa del Lago\\, Medellin\\, Antioquia",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = url;
    download.download = "xv-valentina-sofia.ics";
    document.body.append(download);
    download.click();
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

function celebrate(panel) {
  if (reducedMotion.matches) return;
  const vectors = [
    [-150, -110, -180],
    [-86, -154, -90],
    [-24, -130, 90],
    [48, -152, 150],
    [130, -98, 210],
    [-132, 72, 250],
    [112, 76, 320],
  ];

  vectors.forEach(([x, y, rotation], index) => {
    const petal = document.createElement("span");
    petal.className = "celebration-petal";
    petal.style.setProperty("--celebrate-x", `${x}px`);
    petal.style.setProperty("--celebrate-y", `${y}px`);
    petal.style.setProperty("--celebrate-r", `${rotation}deg`);
    petal.style.background =
      index % 2 ? "var(--gold-bright)" : "var(--rose-500)";
    panel.append(petal);
    petal.addEventListener("animationend", () => petal.remove(), {
      once: true,
    });
  });
}

function setupRsvp() {
  const form = document.querySelector("#rsvp-form");
  const success = document.querySelector("#rsvp-success");
  const edit = document.querySelector("#edit-rsvp");
  const panel = document.querySelector(".rsvp-panel");
  const title = document.querySelector("#success-title");
  const message = document.querySelector("#success-message");
  const count = document.querySelector("#guest-count");
  if (!form || !success || !edit || !panel || !title || !message || !count)
    return;

  form.addEventListener("change", (event) => {
    if (event.target.name !== "attendance") return;
    const cannotAttend = event.target.value === "no";
    count.disabled = cannotAttend;
    if (cannotAttend) count.value = "1";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = form.querySelector(".form-submit");
    const submitText = submit?.querySelector("span");
    const formData = new FormData(form);
    const attends = formData.get("attendance") === "yes";
    const firstName = String(formData.get("guest-name") || "")
      .trim()
      .split(/\s+/)[0];
    const guestName = String(formData.get("guest-name") || "").trim();
    const guestCount = String(formData.get("guest-count") || "1");
    const dietary =
      String(formData.get("dietary") || "Ninguna").trim() || "Ninguna";
    const attendanceText = attends ? "Sí, podré asistir" : "No podré asistir";
    const whatsappText =
      `Hola, quisiera confirmar mi asistencia a la fiesta de quince años de Valentina.%0A%0A` +
      `Familia: ${guestName}%0A` +
      `Confirmación: ${attendanceText}%0A` +
      `Número de asistentes: ${guestCount}%0A` +
      `Restricción alimentaria: ${dietary}%0A%0A` +
      `Muchas gracias por tan hermoso momento.`;
    const whatsappUrl = `https://wa.me/573005960689?text=${whatsappText}`;

    submit?.classList.add("is-loading");
    submit?.setAttribute("aria-busy", "true");
    if (submitText) submitText.textContent = "Enviando...";

    window.setTimeout(() => {
      if (attends) {
        title.textContent = `¡Qué alegría, ${firstName}!`;
        message.textContent =
          "Tu lugar quedó reservado para celebrar esta noche con Valentina.";
      } else {
        title.textContent = `Gracias por responder, ${firstName}`;
        message.textContent =
          "Aunque no puedas acompañarnos, agradecemos mucho que seas parte de esta historia.";
      }

      const whatsappWindow = window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!whatsappWindow) {
        window.location.href = whatsappUrl;
      }

      form.hidden = true;
      success.hidden = false;
      success.focus({ preventScroll: true });
      celebrate(panel);
    }, 650);
  });

  edit.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    const submit = form.querySelector(".form-submit");
    const submitText = submit?.querySelector("span");
    submit?.classList.remove("is-loading");
    submit?.removeAttribute("aria-busy");
    if (submitText) submitText.textContent = "Enviar confirmación";
    form.querySelector("input")?.focus();
  });
}

function init() {
  document.documentElement.classList.add("js");
  finishOpening();
  setupImageFallback();
  setupReveals();
  setupPetals();
  setupParallax();
  setupCountdown();
  setupCalendarDownload();
  setupRsvp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
