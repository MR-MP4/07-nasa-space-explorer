// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const getImgButton = document.getElementById('getImg');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDescription = document.getElementById('modalDescription');
const offlineBanner = document.getElementById("offline-banner");
let notificationCounter = localStorage.getItem("notificationCounter") || 0;

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

if (notificationCounter === 5) {
  requestNotificationPermission();
}

getImgButton.addEventListener('click', fetchImages);
closeModalButton.addEventListener('click', () => imageModal.close());
imageModal.addEventListener('click', event => {
  if (event.target === imageModal) {
    imageModal.close();
  }
});

function formatDateForApi(date) {
  const [year, month, day] = date.split('-');
  return `${year.slice(-2)}${month}${day}`;
}

function cleanExplanation(explanation) {
    const parser = new DOMParser();
    const ex = parser.parseFromString(explanation, "text/html");

    return ex.body.textContent.trim();
}

function openImageModal(item) {
  notificationCounter++;
  localStorage.setItem("notificationCounter", notificationCounter);
  modalMedia.innerHTML = '';
  modalTitle.textContent = item.title;
  modalDate.textContent = `Date: ${item.date}`;
  modalDescription.textContent = cleanExplanation(item.explanation);

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  } else if (item.media_type === 'video') {
    const videoLink = document.createElement('a');
    videoLink.href = item.url;
    videoLink.target = '_blank';
    videoLink.rel = 'noopener noreferrer';
    videoLink.classList.add('video-link');
    videoLink.textContent = 'Watch this video on NASA (opens in a new tab)';
    modalMedia.appendChild(videoLink);
  }

  imageModal.showModal();
}

function createGallery(imageData) {
  gallery.innerHTML = '';

  imageData.forEach(item => {
    const article = document.createElement('article');
    article.classList.add('gallery-item');
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-haspopup', 'dialog');
    article.setAttribute('aria-label', `View details for ${item.title}`);
    article.addEventListener('click', () => openImageModal(item));
    article.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImageModal(item);
      }
    });
    // Create the title
    const title = document.createElement('h2');
    title.textContent = item.title;

    // Create the date
    const date = document.createElement('p');
    date.textContent = `Date: ${item.date}`;

    // Display the appropriate media
    if (item.media_type === 'image') {
      const img = document.createElement('img');

      img.src = item.hdurl || item.url;
      img.alt = item.title;
      img.classList.add('gallery-image');

      const imageFrame = document.createElement('div');
      imageFrame.classList.add('gallery-image-frame');
      imageFrame.appendChild(img);
      article.appendChild(imageFrame);

    } else if (item.media_type === 'video') {
      const videoNotice = document.createElement('p');
      videoNotice.classList.add('video-notice');
      videoNotice.textContent = 'Video available — click for details and a link to NASA';
      article.appendChild(videoNotice);
    }

    article.appendChild(title);
    article.appendChild(date);

    gallery.appendChild(article);
  });
}

async function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  console.log("Start date:", startDate);
  console.log("End date:", endDate);

  if (!startDate || !endDate) {
    gallery.textContent = 'Please select both a start date and an end date.';
    return;
  }

  gallery.textContent = 'Loading space images...';

  try {
    const formattedStartDate = formatDateForApi(startDate);
    const formattedEndDate = formatDateForApi(endDate);
    const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?date_from=${formattedStartDate}&date_to=${formattedEndDate}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API request failed (${response.status}). Check the date range or API key and try again.`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(data.error?.message || 'NASA returned an unexpected response.');
    }
    console.log('Fetched data:', data);
    createGallery(data);

  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.textContent = error instanceof Error
      ? error.message
      : 'Unable to load space images. Please try again.';
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
    .register("./service-worker. js")
    .then((reg) => console.log("[App] Service worker registered:", reg. scope))
    .catch((err) => console.error("[App] Service worker registration  failed:", err));
  });
}

function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineBanner.classList.add("hidden");
  } else {
    offlineBanner.classList.remove("hidden");
  }
}

let deferredInstallPrompt = null;
const installBanner = document.getElementById("install-banner");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBanner.classList.remove("hidden");
});

const installButton = document.getElementById("install-banner");

if (window.matchMedia("(display-mode: standalone)").matches) {
    installButton.style.display = "none";
}

window.addEventListener("appinstalled", () => {
    installButton.style.display = "none";
});

installBanner.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;

  const installPrompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  installBanner.classList.add("hidden");

  installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;
  console.log(`[App] Install prompt outcome: ${outcome}`);
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installBanner.classList.add("hidden");
});

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("[App] This browser doesn't support notifications");
    return;
  }

  Notification.requestPermission().then((permission) => {
    console.log(`[App] Notification permission: ${permission}`);
    if (permission === "granted") {
      new Notification("Space Explorer", {
        body: "Notifications are on! We'll keep this simple for now.",
        icon: "img/nasa-worm-logo.png",
      });
    }
  });
}