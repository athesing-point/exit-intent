document.addEventListener("DOMContentLoaded", function () {
  const exitModal = document.querySelector(".modal-exitpopup");
  const closeButton = document.querySelector(".close");
  const background = document.querySelector(".modal-bg-layer");
  const section = document.querySelector(".section-exit-popup");
  const exitHeadline = document.getElementById("exit-headline");
  const postContents = document.querySelectorAll(".blog-rich-text");

  let totalHeight = 0;
  if (postContents.length > 0) {
    postContents.forEach((element) => {
      totalHeight += element.offsetHeight;
    });
  } else {
    totalHeight = document.documentElement.scrollHeight;
  }

  if (!exitModal || !closeButton || !background || !section || !exitHeadline) {
    console.error("One or more essential elements are missing!");
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

  function checkFeatureFlags() {
    try {
      const featureFlagValue = posthog.getFeatureFlag("cro14-exit-intent-logic");

      if (featureFlagValue === "test") {
        let hasShown = false;
        window.addEventListener("scroll", function () {
          if (!hasShown && canShowPopup()) {
            const scrollPercentage = (window.scrollY / (totalHeight - window.innerHeight)) * 100;
            if (scrollPercentage >= 66) {
              showPopup();
              hasShown = true;
            }
          }
        });
      } else if (featureFlagValue === "control") {
        // Control: Original exit-intent behavior
        document.addEventListener("mouseleave", function (event) {
          // console.log("Mouse leave event:", event.clientY);
          if (event.clientY <= 0 && canShowPopup()) {
            showPopup();
          }
        });

        document.addEventListener("touchmove", function (event) {
          var currentScroll = window.scrollY || document.documentElement.scrollTop;
          // console.log("Touch move event:", currentScroll, event.touches[0].clientY, event.touches[0].screenY);
          if (currentScroll <= 0 && event.touches[0].clientY > event.touches[0].screenY && canShowPopup()) {
            showPopup();
          }
        });
      } else {
        console.warn("Unknown feature flag value:", featureFlagValue);
      }
    } catch (error) {
      console.error("Error in checkFeatureFlags:", error);
    }
  }

  function observePostHogInitialization() {
    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === "childList" && typeof posthog !== "undefined" && posthog.getFeatureFlag) {
          observer.disconnect();
          checkFeatureFlags();
        }
      });
    });

    observer.observe(document, { childList: true, subtree: true });

    // Set a timeout to default to control if PostHog doesn't load
    setTimeout(() => {
      if (typeof posthog === "undefined" || !posthog.getFeatureFlag) {
        observer.disconnect();
        console.warn("PostHog not loaded, defaulting to control behavior");
      }
    }, 3000); // 3 second timeout
  }

  window.addEventListener("load", function () {
    if (typeof posthog !== "undefined" && posthog.getFeatureFlag) {
      checkFeatureFlags();
    } else {
      observePostHogInitialization();
    }
  });
});
