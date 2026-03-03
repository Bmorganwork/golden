document.addEventListener("DOMContentLoaded", () => {
  // Formspree: replace with your form ID from https://formspree.io (set form email to work.bmorgan@gmail.com)
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/maqdgdpd";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const yearSpan = document.getElementById("year");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  function handleScroll() {
    if (!header) return;
    const offset = window.scrollY || window.pageYOffset;
    if (offset > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });

    navLinks.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLAnchorElement) {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      }
    });
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  const internalLinks = document.querySelectorAll(
    'a[href^="#"]:not([href="#"])'
  );

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLAnchorElement)) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const id = href.slice(1);
      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();

      section.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  const shareButtons = document.querySelectorAll(".btn-share-movement");
  if (shareButtons.length > 0) {
    const shareUrl = window.location.href.split("#")[0];
    const shareData = {
      title: "Goalden – Achieve More Together",
      text: "Help bring Goalden to life by sharing this page with friends and family.",
      url: shareUrl,
    };

    const handleShareClick = (event) => {
      event.preventDefault();

      if (navigator.share) {
        navigator
          .share(shareData)
          .catch(() => {
          });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            alert("Link copied! Share it with someone who’d love Goalden.");
          })
          .catch(() => {
            const fallback = prompt(
              "Copy this link and share it with others:",
              shareUrl
            );
          });
        return;
      }

      prompt("Copy this link and share it with others:", shareUrl);
    };

    shareButtons.forEach((button) => {
      button.addEventListener("click", handleShareClick);
    });
  }

  const strugglesCard = document.querySelector(".struggles-card");
  const openStrugglesBtn = document.querySelector(".btn-open-struggles");
  const strugglesForm = document.querySelector(".struggles-form");
  const cancelStrugglesBtn = document.querySelector(".btn-cancel-struggles");
  const strugglesTextarea = document.getElementById("strugglesMessage");
  const strugglesStatus = document.querySelector(".struggles-status");

  function setStrugglesStatus(message, type) {
    if (!strugglesStatus) return;
    strugglesStatus.textContent = message;
    strugglesStatus.classList.toggle("is-error", type === "error");
  }

  function openStruggles() {
    if (!strugglesForm) return;
    strugglesForm.hidden = false;
    setStrugglesStatus("", "ok");
    if (strugglesTextarea) {
      strugglesTextarea.focus();
    }
    if (strugglesCard) {
      strugglesCard.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }

  function closeStruggles() {
    if (!strugglesForm) return;
    strugglesForm.hidden = true;
    setStrugglesStatus("", "ok");
    if (strugglesTextarea) {
      strugglesTextarea.value = "";
    }
  }

  if (openStrugglesBtn) {
    openStrugglesBtn.addEventListener("click", openStruggles);
  }

  if (cancelStrugglesBtn) {
    cancelStrugglesBtn.addEventListener("click", closeStruggles);
  }

  async function sendToGoaldenEmail(formType, message) {
    if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
      return { ok: false };
    }
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _subject: `Goalden: ${formType}`,
        form_type: formType,
        message: message,
        page: window.location.href.split("#")[0],
      }),
    });
    return { ok: res.ok };
  }

  if (strugglesForm) {
    strugglesForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = (strugglesTextarea?.value ?? "").trim();
      if (!message) {
        setStrugglesStatus("Please write a quick message first.", "error");
        strugglesTextarea?.focus();
        return;
      }

      const submitBtn = strugglesForm.querySelector('button[type="submit"]');
      const wasDisabled = submitBtn?.disabled;
      if (submitBtn) submitBtn.disabled = true;
      setStrugglesStatus("Sending…", "ok");

      const { ok } = await sendToGoaldenEmail("Struggles", message);

      if (submitBtn) submitBtn.disabled = wasDisabled;
      if (!ok) {
        setStrugglesStatus("Couldn't send email. Your message was saved here only.", "error");
      }

      try {
        const key = "goalden_struggles_messages";
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          message,
          createdAt: new Date().toISOString(),
          page: window.location.href.split("#")[0],
        });
        localStorage.setItem(key, JSON.stringify(list));
        if (ok) {
          setStrugglesStatus("Saved and sent. Thank you for sharing—this helps a lot.", "ok");
        }
        if (strugglesTextarea) strugglesTextarea.value = "";
      } catch {
        if (!ok) {
          setStrugglesStatus(
          "Saved locally wasn’t available here—please copy your message and try again.",
          "error"
          );
        }
      }
    });
  }

  const ideasCard = document.querySelector(".ideas-card");
  const openIdeasBtn = document.querySelector(".btn-open-ideas");
  const ideasForm = document.querySelector(".ideas-form");
  const cancelIdeasBtn = document.querySelector(".btn-cancel-ideas");
  const ideasTextarea = document.getElementById("ideasMessage");
  const ideasStatus = document.querySelector(".ideas-status");

  function setIdeasStatus(message, type) {
    if (!ideasStatus) return;
    ideasStatus.textContent = message;
    ideasStatus.classList.toggle("is-error", type === "error");
  }

  function openIdeas() {
    if (!ideasForm) return;
    ideasForm.hidden = false;
    setIdeasStatus("", "ok");
    if (ideasTextarea) {
      ideasTextarea.focus();
    }
    if (ideasCard) {
      ideasCard.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }

  function closeIdeas() {
    if (!ideasForm) return;
    ideasForm.hidden = true;
    setIdeasStatus("", "ok");
    if (ideasTextarea) {
      ideasTextarea.value = "";
    }
  }

  if (openIdeasBtn) {
    openIdeasBtn.addEventListener("click", openIdeas);
  }

  if (cancelIdeasBtn) {
    cancelIdeasBtn.addEventListener("click", closeIdeas);
  }

  if (ideasForm) {
    ideasForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = (ideasTextarea?.value ?? "").trim();
      if (!message) {
        setIdeasStatus("Please write a quick idea first.", "error");
        ideasTextarea?.focus();
        return;
      }

      const submitBtn = ideasForm.querySelector('button[type="submit"]');
      const wasDisabled = submitBtn?.disabled;
      if (submitBtn) submitBtn.disabled = true;
      setIdeasStatus("Sending…", "ok");

      const { ok } = await sendToGoaldenEmail("App ideas", message);

      if (submitBtn) submitBtn.disabled = wasDisabled;
      if (!ok) {
        setIdeasStatus("Couldn't send email. Your idea was saved here only.", "error");
      }

      try {
        const key = "goalden_app_ideas_messages";
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          message,
          createdAt: new Date().toISOString(),
          page: window.location.href.split("#")[0],
        });
        localStorage.setItem(key, JSON.stringify(list));
        if (ok) {
          setIdeasStatus("Saved and sent. Thank you—your ideas help shape the app.", "ok");
        }
        if (ideasTextarea) ideasTextarea.value = "";
      } catch {
        if (!ok) {
          setIdeasStatus(
          "Saved locally wasn’t available here—please copy your message and try again.",
          "error"
          );
        }
      }
    });
  }

  const notifyModal = document.getElementById("notify-modal");
  const notifyForm = document.getElementById("notify-form");
  const notifyEmailInput = document.getElementById("notify-email");
  const notifyStatus = document.getElementById("notify-status");
  const notifyCloseBtn = document.querySelector(".notify-modal-close");
  const notifyBackdrop = document.querySelector(".notify-modal-backdrop");
  const notifyLaunchBtns = document.querySelectorAll(".btn-notify-launch");

  function setNotifyStatus(message, isError) {
    if (!notifyStatus) return;
    notifyStatus.textContent = message;
    notifyStatus.classList.toggle("is-error", !!isError);
  }

  function openNotifyModal() {
    if (!notifyModal) return;
    notifyModal.hidden = false;
    setNotifyStatus("", false);
    if (notifyEmailInput) {
      notifyEmailInput.value = "";
      notifyEmailInput.focus();
    }
    document.body.style.overflow = "hidden";
  }

  function closeNotifyModal() {
    if (!notifyModal) return;
    notifyModal.hidden = true;
    document.body.style.overflow = "";
  }

  notifyLaunchBtns.forEach((btn) => {
    btn.addEventListener("click", openNotifyModal);
  });

  if (notifyCloseBtn) notifyCloseBtn.addEventListener("click", closeNotifyModal);
  if (notifyBackdrop) notifyBackdrop.addEventListener("click", closeNotifyModal);

  notifyModal?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNotifyModal();
  });

  if (notifyForm) {
    notifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (notifyEmailInput?.value ?? "").trim();
      if (!email) {
        setNotifyStatus("Please enter your email.", true);
        notifyEmailInput?.focus();
        return;
      }

      const submitBtn = notifyForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setNotifyStatus("Sending…", false);

      let ok = false;
      if (FORMSPREE_ENDPOINT && !FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: "Goalden: Download link signup",
            email: email,
            form_type: "Download link signup",
          }),
        });
        ok = res.ok;
      }

      if (submitBtn) submitBtn.disabled = false;
      if (ok) {
        setNotifyStatus("Your email is saved. We’ll send you the download link when the app is ready.", false);
        if (notifyEmailInput) notifyEmailInput.value = "";
      } else {
        setNotifyStatus("Something went wrong. Please try again later.", true);
      }
    });
  }
});

