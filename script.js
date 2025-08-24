const homeGrid = document.getElementById('home-grid');
const galleryPage = document.getElementById('gallery-page');
const pinterestGrid = document.getElementById('pinterest-grid');
const galleryTitle = document.getElementById('gallery-title');
const gallerySubtitle = document.getElementById('gallery-subtitle');
const backButton = document.querySelector('.back-button');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.querySelector('.modal-close');
const searchInput = document.querySelector('.search-input');
const searchSuggestions = document.querySelector('.search-suggestions');
const loadMoreHome = document.getElementById('load-more-home');
const loadMoreGallery = document.getElementById('load-more-gallery');

const ITEMS_PER_PAGE = 20;
let homeImages = [];
let homePageIndex = 0;
let galleryImages = [];
let galleryPageIndex = 0;

const lazyObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

function observeImage(img) {
  lazyObserver.observe(img);
}

function createPinterestItem(image) {
  const pinterestItem = document.createElement('div');
  pinterestItem.className = 'pinterest-item fade-in';
  pinterestItem.innerHTML = `
      <img data-src="${image.src}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Image" class="lazy-image">
      <div class="image-info">
        <p class="image-description">${image.description}</p>
        <span class="image-tag">${image.tag}</span>
      </div>
    `;
  const img = pinterestItem.querySelector('img');
  observeImage(img);
  img.addEventListener('click', () => showModal(image.src));
  const tag = pinterestItem.querySelector('.image-tag');
  tag.addEventListener('click', () => {
    console.log('Navigating to gallery.html?tag=', image.tag);
    window.location.href = `gallery.html?tag=${encodeURIComponent(image.tag)}`;
  });
  return pinterestItem;
}

// Fetch images from images.json
async function fetchImages() {
  try {
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    const response = await fetch(`${basePath}/images.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const images = await response.json();
    console.log('Fetched Images:', images);
    return images.map(image => ({
      ...image,
      src: `${basePath}/${image.src}`
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

// Derive unique tags from images
async function fetchTags() {
  try {
    const images = await fetchImages();
    const tags = [...new Set(images.map(image => image.tag))];
    console.log('Derived Tags:', tags);
    return tags;
  } catch (error) {
    console.error('Error deriving tags:', error);
    return [];
  }
}

// Render home page with pagination
async function renderHome() {
  if (!homeGrid) {
    console.log('Not on home page, skipping renderHome');
    return;
  }
  homeImages = await fetchImages();
  if (homeImages.length === 0) {
    console.warn('No images found for home page');
    homeGrid.innerHTML = '<p>No images available.</p>';
    return;
  }
  homeGrid.innerHTML = '';
  homePageIndex = 0;
  appendHomeImages();
  if (loadMoreHome) {
    loadMoreHome.addEventListener('click', appendHomeImages);
  }
}

function appendHomeImages() {
  const start = homePageIndex * ITEMS_PER_PAGE;
  const nextImages = homeImages.slice(start, start + ITEMS_PER_PAGE);
  nextImages.forEach(image => {
    homeGrid.appendChild(createPinterestItem(image));
  });
  homePageIndex++;
  if (loadMoreHome) {
    if (homePageIndex * ITEMS_PER_PAGE >= homeImages.length) {
      loadMoreHome.style.display = 'none';
    } else {
      loadMoreHome.style.display = 'block';
    }
  }
}

// Render gallery for a specific tag with pagination
async function renderGallery(tag) {
  if (!pinterestGrid) {
    console.log('Not on gallery page, skipping renderGallery');
    return;
  }
  const images = await fetchImages();
  galleryImages = images.filter(image => image.tag.toLowerCase() === tag.toLowerCase());
  console.log(`Filtered Images for tag "${tag}":`, galleryImages);
  pinterestGrid.innerHTML = '';
  galleryPageIndex = 0;
  if (galleryImages.length === 0) {
    console.warn(`No images found for tag "${tag}"`);
    pinterestGrid.innerHTML = `<p>No images found for tag "${tag}".</p>`;
    return;
  }
  appendGalleryImages();
  if (loadMoreGallery) {
    loadMoreGallery.addEventListener('click', appendGalleryImages);
  }
}

function appendGalleryImages() {
  const start = galleryPageIndex * ITEMS_PER_PAGE;
  const nextImages = galleryImages.slice(start, start + ITEMS_PER_PAGE);
  nextImages.forEach(image => {
    pinterestGrid.appendChild(createPinterestItem(image));
  });
  galleryPageIndex++;
  if (loadMoreGallery) {
    if (galleryPageIndex * ITEMS_PER_PAGE >= galleryImages.length) {
      loadMoreGallery.style.display = 'none';
    } else {
      loadMoreGallery.style.display = 'block';
    }
  }
}

// Show modal with image preview
function showModal(src) {
  if (!modal || !modalImage) {
    console.error('Modal or modal image element not found');
    return;
  }
  modalImage.src = src;
  modal.style.display = 'block';
}

// Close modal
if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// Back to home
if (backButton) {
  backButton.addEventListener('click', () => {
    console.log('Navigating back to index.html');
    window.location.href = 'index.html';
  });
}

// Handle search functionality
async function setupSearch() {
  if (!searchInput || !searchSuggestions) {
    console.log('Search elements not found, skipping setupSearch');
    return;
  }
  try {
    const tags = await fetchTags();
    if (tags.length === 0) {
      console.warn('No tags available for search');
      return;
    }

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      searchSuggestions.innerHTML = '';
      if (query === '') {
        searchSuggestions.classList.remove('active');
        return;
      }

      const filteredTags = tags.filter(tag => tag.toLowerCase().includes(query));
      if (filteredTags.length === 0) {
        searchSuggestions.innerHTML = '<div class="search-suggestion">No tags found</div>';
        searchSuggestions.classList.add('active');
        return;
      }

      filteredTags.forEach(tag => {
        const suggestion = document.createElement('div');
        suggestion.className = 'search-suggestion';
        suggestion.textContent = tag;
        suggestion.addEventListener('click', () => {
          console.log('Selected tag from search:', tag);
          window.location.href = `gallery.html?tag=${encodeURIComponent(tag)}`;
          searchInput.value = '';
          searchSuggestions.classList.remove('active');
        });
        searchSuggestions.appendChild(suggestion);
      });
      searchSuggestions.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchSuggestions.classList.remove('active');
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        const tag = tags.find(t => t.toLowerCase() === searchInput.value.toLowerCase().trim());
        if (tag) {
          console.log('Navigating to tag from search:', tag);
          window.location.href = `gallery.html?tag=${encodeURIComponent(tag)}`;
          searchInput.value = '';
          searchSuggestions.classList.remove('active');
        } else {
          console.warn('Tag not found:', searchInput.value);
          searchSuggestions.innerHTML = '<div class="search-suggestion">Tag not found</div>';
          searchSuggestions.classList.add('active');
        }
      }
    });
  } catch (error) {
    console.error('Error setting up search:', error);
  }
}

// Initialize based on page
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');
  console.log('Tag from URL:', tag);
  if (tag && galleryTitle && gallerySubtitle) {
    galleryTitle.textContent = tag;
    gallerySubtitle.textContent = `A collection of ${tag} inspired images.`;
    await renderGallery(tag);
  } else {
    try {
      await renderHome();
      await setupSearch();
    } catch (error) {
      console.error('Error initializing home page:', error);
      if (homeGrid) {
        homeGrid.innerHTML = '<p>Error loading images.</p>';
      }
    }
  }
}

init();