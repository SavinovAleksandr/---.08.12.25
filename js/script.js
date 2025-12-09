
// Текущий год в футере
(function setYear() {
  const yearSpan = document.getElementById("js-year");
  const yearSpanPrivacy = document.getElementById("js-year-privacy");
  const year = new Date().getFullYear();
  if (yearSpan) yearSpan.textContent = year;
  if (yearSpanPrivacy) yearSpanPrivacy.textContent = year;
})();

// Плавный скролл по якорям
(function smoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = document.querySelector(".site-header").offsetHeight || 0;
          const rect = target.getBoundingClientRect();
          const offsetTop = rect.top + window.pageYOffset - headerOffset - 10;

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    });
  });
})();

// Подсветка активного пункта меню
(function highlightNavOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");

  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    const scrollPos = window.scrollY || window.pageYOffset;
    const headerHeight = document.querySelector(".site-header").offsetHeight || 0;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    let currentId = "";
    sections.forEach((section) => {
      const top = section.offsetTop - headerHeight - 40;
      const bottom = section.offsetTop + section.offsetHeight;
      
      // Если доскроллили до конца страницы, подсвечиваем последнюю секцию
      if (scrollPos + windowHeight >= documentHeight - 50) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
          currentId = lastSection.id;
        }
      } else if (scrollPos >= top && scrollPos < bottom) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href").replace("#", "");
      if (href === currentId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", onScroll);
  onScroll();
})();

// Мобильное меню
(function mobileNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".main-nav");
  const backdrop = document.querySelector(".nav-backdrop");
  const links = document.querySelectorAll(".main-nav a");

  if (!burger || !nav) return;

  function closeNav() {
    burger.classList.remove("is-open");
    nav.classList.remove("open");
    backdrop && backdrop.classList.remove("is-open");
  }

  burger.addEventListener("click", () => {
    const willOpen = !burger.classList.contains("is-open");
    burger.classList.toggle("is-open", willOpen);
    nav.classList.toggle("open", willOpen);
    backdrop && backdrop.classList.toggle("is-open", willOpen);
  });

  backdrop &&
    backdrop.addEventListener("click", () => {
      closeNav();
    });

  links.forEach((link) =>
    link.addEventListener("click", () => {
      closeNav();
    })
  );
})();

// Модальное окно
(function modal() {
  const modal = document.getElementById("contact-modal");
  const backdrop = document.querySelector(".modal-backdrop");
  const openButtons = document.querySelectorAll(".js-open-modal");
  const closeButtons = document.querySelectorAll("[data-modal-close]");
  const purposeField = document.getElementById("modal-purpose");

  if (!modal || !backdrop) return;

  function openModal(purposeText) {
    modal.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (purposeField && purposeText) {
      purposeField.value = purposeText;
    }
  }

  function closeModal() {
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const purpose = btn.getAttribute("data-modal-purpose") || "Заявка с сайта";
      openModal(purpose);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();

// Отправка формы через AJAX на сервер
(function handleForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Отправить заявку";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const purpose = document.getElementById("modal-purpose")?.value || "Заявка с сайта";
    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const consent = document.getElementById("consent");

    if (!phone || !email) {
      alert("Пожалуйста, заполните телефон и e-mail.");
      return;
    }

    if (consent && !consent.checked) {
      alert("Для отправки заявки необходимо согласиться с условиями обработки данных.");
      return;
    }

    // Блокируем кнопку и показываем загрузку
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Отправка...";
    }

    try {
      const response = await fetch("send-email.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          purpose: purpose,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Закрываем модальное окно
        const modal = document.getElementById("contact-modal");
        if (modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }
        // Очищаем форму
        form.reset();
      } else {
        alert(data.message || "Произошла ошибка при отправке. Пожалуйста, попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую по email: info@digital-tribe.ru");
    } finally {
      // Восстанавливаем кнопку
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
})();

// Анимация появления секций при скролле
(function animateOnScroll() {
  const sections = document.querySelectorAll(".section");
  if (!sections.length) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
})();
