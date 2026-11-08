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

async function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  console.log(`Fetching images from ${startDate} to ${endDate}`);
  // Here you would typically call an API to fetch images based on the date range
  try {
    const API_URL = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(API_URL);
    const data = await response.json();
    const imageData = data.filter(item => item.media_type === 'image');

gallery.innerHTML = imageData.map(item => `
  <article class="gallery-item">
    <img src="${item.url}" alt="${item.title}">
    <h2>${item.title}</h2>
    <p>${item.date}</p>
    <p>${item.explanation}</p>
  </article>
`).join('');
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}
