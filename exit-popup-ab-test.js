document.addEventListener("DOMContentLoaded", function () {
  const exitModal = document.querySelector(".modal-exitpopup");
  const closeButton = document.querySelector(".close");
  const background = document.querySelector(".modal-bg-layer");
  const section = document.querySelector(".section-exit-popup");
  const exitHeadline = document.getElementById("exit-headline");
  const postContent = document.querySelector(".blog-rich-text"); // Adjust selector as needed

  if (!exitModal || !closeButton || !background || !section || !exitHeadline || !postContent) {
    console.error("One or more elements are missing!");
    return;
  }

  function checkAndFillHeadline() {
    if (exitHeadline.textContent.trim() === "") {
      exitHeadline.textContent = "Get up to $500k.";
    }
  }
  checkAndFillHeadline();

  function getDismissalKey() {
    return `exitPopupDismissedTime_${window.location.hostname}`;
  }

  function closePopup() {
    exitModal.style.opacity = "0";
    background.style.opacity = "0";
    exitModal.style.transform = "translateY(0px)";
    setTimeout(() => {
      section.style.display = "none";
    }, 1500);
    localStorage.setItem(getDismissalKey(), Date.now());
  }

  function canShowPopup() {
    const dismissedTime = localStorage.getItem(getDismissalKey());
    if (!dismissedTime) return true;
    const cooldownPeriod = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(dismissedTime) > cooldownPeriod;
  }

  if (!canShowPopup()) return;

  closeButton.addEventListener("click", closePopup);
  background.addEventListener("click", closePopup);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePopup();
  });

  function showPopup() {
    section.style.display = "flex";
    setTimeout(() => {
      exitModal.style.transform = "translateY(0px)";
      exitModal.style.opacity = "1";
      background.style.opacity = "1";
    }, 25);
  }

  // PostHog feature flag check
  posthog.onFeatureFlags(function () {
    const isTestVariant = posthog.getFeatureFlag("exit-popup-test") === "test";

    if (isTestVariant) {
      // Test variant: Show popup after 50% scroll
      let hasShown = false;
      window.addEventListener("scroll", function () {
        if (!hasShown && canShowPopup()) {
          const scrollPercentage = (window.scrollY / (postContent.offsetHeight - window.innerHeight)) * 100;
          if (scrollPercentage >= 50) {
            showPopup();
            hasShown = true;
          }
        }
      });
    } else {
      // Control: Original exit-intent behavior
      document.addEventListener("mouseleave", function (event) {
        if (event.clientY <= 0 && canShowPopup()) {
          showPopup();
        }
      });

      document.addEventListener("touchmove", function (event) {
        var currentScroll = window.scrollY || document.documentElement.scrollTop;
        if (currentScroll <= 0 && event.touches[0].clientY > event.touches[0].screenY && canShowPopup()) {
          showPopup();
        }
      });
    }
  });
});
