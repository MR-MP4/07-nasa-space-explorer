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

getImgButton.addEventListener('click', fetchImages);

function createGallery(imageData) {
  gallery.innerHTML = '';
  imageData.forEach(item => {
    const article = document.createElement('article');
    article.classList.add('gallery-item');

    article.innerHTML = `
    <img src="${item.hdurl}" alt="${item.title}" class="gallery-image">
    <div class="gallery-info">
      <h2 class="gallery-title">${item.title}</h2>
      <p class="gallery-date">Created: ${item.date}</p>
      <p class="gallery-description">${item.explanation}</p>
    </div>
    `;

    gallery.appendChild(article);
  });
}

async function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.textContent = 'Please select both a start date and an end date.';
    return;
  }

  gallery.textContent = 'Loading space images...';

  try {
    const API_KEY = 'R8Htz8W9FFnPLtcMmPnjjBLqL9BbcGLmRnjjc7kc';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API request failed (${response.status}). Check the date range or API key and try again.`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(data.error?.message || 'NASA returned an unexpected response.');
    }
    createGallery(data);
  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.textContent = error instanceof Error
      ? error.message
      : 'Unable to load space images. Please try again.';
  }
}
