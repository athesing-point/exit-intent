document.addEventListener("DOMContentLoaded", function () {
  const exitModal = document.querySelector(".modal-exitpopup");
  const closeButton = document.querySelector(".close");
  const background = document.querySelector(".modal-bg-layer");
  const section = document.querySelector(".section-exit-popup");
  const exitHeadline = document.getElementById("exit-headline"); // Get the h2 element

  if (!exitModal || !closeButton || !background || !section || !exitHeadline) {
    console.error("One or more elements are missing!");
    return; // Stop further execution if elements are missing
  }

  // Function to check and fill the headline if empty
  function checkAndFillHeadline() {
    if (exitHeadline.textContent.trim() === "") {
      exitHeadline.textContent = "Get up to $600k.";
    }
  }

  // Call the function to check and fill the headline
  checkAndFillHeadline();

  function getDismissalKey() {
    return `exitPopupDismissedTime_${window.location.hostname}`;
  }

  // Function to close the popup and remember the dismissal
  function closePopup() {
    exitModal.style.opacity = "0";
    background.style.opacity = "0";
    exitModal.style.transform = "translateY(0px)";
    setTimeout(() => {
      section.style.display = "none";
    }, 1500); // Assuming the transition duration to zero opacity is 1.5 seconds

    // Store dismissal time in localStorage with domain-specific key
    localStorage.setItem(getDismissalKey(), Date.now());
  }

  // Check if the popup was already dismissed and if the cooldown period has passed
  function canShowPopup() {
    const dismissedTime = localStorage.getItem(getDismissalKey());
    if (!dismissedTime) return true;

    const cooldownPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return Date.now() - parseInt(dismissedTime) > cooldownPeriod;
  }

  // Check if the popup was already dismissed and if the cooldown period has passed
  if (!canShowPopup()) {
    return; // Do not show the popup if it was dismissed recently
  }

  // Close popup when clicking the close button
  closeButton.addEventListener("click", closePopup);

  // Close popup when clicking on the background
  background.addEventListener("click", closePopup);

  // Close popup when pressing the escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePopup();
    }
  });

  // Function to show the popup / options on transition
  function showPopup() {
    section.style.display = "flex";
    setTimeout(() => {
      exitModal.style.transform = "translateY(0px)"; // Starting value is set in CSS on component in PDC.
      exitModal.style.opacity = "1";
      background.style.opacity = "1";
    }, 25);
  }

  // Existing desktop functionality with mouseleave
  document.addEventListener("mouseleave", function (event) {
    if (event.clientY <= 0 && canShowPopup()) {
      showPopup();
    }
  });

  // Mobile-specific functionality
  // Detect Scroll Up at the Top of the Page for mobile
  document.addEventListener("touchmove", function (event) {
    var currentScroll = window.scrollY || document.documentElement.scrollTop;
    if (currentScroll <= 0 && event.touches[0].clientY > event.touches[0].screenY && canShowPopup()) {
      showPopup();
    }
  });
});
