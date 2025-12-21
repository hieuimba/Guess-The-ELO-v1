/*
 * Modal
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2024 - Licensed under MIT
 */

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 500; // ms
let visibleModal = null;

const aboutButton = document.getElementById("aboutButton");
const feedbackButton = document.getElementById("feedbackButton");
const howToPlayButton = document.getElementById("howToPlayButton");
const aboutCloseButton = document.getElementById("aboutCloseButton");
const feedbackCloseButton = document.getElementById("feedbackCloseButton");
const howToPlayCloseButton = document.getElementById("howToPlayCloseButton");

aboutButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("aboutModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

aboutCloseButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("aboutModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

feedbackButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("feedbackModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

feedbackCloseButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("feedbackModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

howToPlayButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("howToPlayModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

howToPlayCloseButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modal = document.getElementById("howToPlayModal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
});

// Open modal
const openModal = (modal) => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
};

// Close modal
const closeModal = (modal) => {
  visibleModal = null;
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Close with a click outside
document.addEventListener("click", (event) => {
  if (visibleModal === null) return;
  const modalContent = visibleModal.querySelector("article");
  const isClickInside = modalContent.contains(event.target);
  !isClickInside && closeModal(visibleModal);
});

// Close with Esc key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && visibleModal) {
    closeModal(visibleModal);
  }
});

// Get scrollbar width
const getScrollbarWidth = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  return scrollbarWidth;
};

// Is scrollbar visible
const isScrollbarVisible = () => {
  return document.body.scrollHeight > screen.height;
};

// Feedback form handling
const feedbackForm = document.getElementById("feedbackForm");
const feedbackMessage = document.getElementById("feedbackMessage");

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const feedback = document.getElementById("userFeedback").value.trim();

  // Show loading state
  const submitButton = document.getElementById("submitFeedback");
  submitButton.setAttribute("aria-busy", "true");
  submitButton.disabled = true;
  feedbackMessage.style.display = "none";

  // Discord webhook URL
  const webhookUrl = "https://discord.com/api/webhooks/1452100953410109443/UbG0F05rQqs39nLiy2GB_VedTgZZcGSr7yjo-cUWc9CLu6-ev5zgXI9MtzRHkcTdVRZ5";

  // Build fields array dynamically based on provided values
  const fields = [];

  if (name) {
    fields.push({
      name: "👤 Name",
      value: name,
      inline: true
    });
  }

  if (email) {
    fields.push({
      name: "📧 Email",
      value: email,
      inline: true
    });
  }

  fields.push({
    name: "💬 Feedback",
    value: feedback,
    inline: false
  });

  // Create Discord embed message
  const discordMessage = {
    embeds: [{
      title: "New Feedback - Guess The ELO",
      color: 5814783, 
      fields: fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: "Guess The ELO Feedback System"
      }
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage)
    });

    if (response.ok) {
      // Success
      feedbackMessage.innerHTML = '<span style="color: oklch(62.7% 0.194 149.214); font-size: 1rem">Thank you for your feedback! 😄</span>';
      feedbackMessage.style.display = "block";

      // Clear form
      feedbackForm.reset();

      // Hide message after 5 seconds
      setTimeout(() => {
        feedbackMessage.style.display = "none";
      }, 5000);
    } else {
      throw new Error("Failed to send feedback");
    }
  } catch (error) {
    // Error
    feedbackMessage.innerHTML = '<span style="color: oklch(57.7% 0.245 27.325);">Sorry, something went wrong. Please try again later.</span>';
    feedbackMessage.style.display = "block";
    console.error("Error sending feedback:", error);
  } finally {
    // Reset button state
    submitButton.removeAttribute("aria-busy");
    submitButton.disabled = false;
  }
});
