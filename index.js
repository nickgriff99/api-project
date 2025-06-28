fetch('https://emojihub.yurace.pro/api/all')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));

const apiBaseUrl = 'https://emojihub.yurace.pro/api/all';
const messages = {
  loading: 'Loading...',
  noResults: 'No results found.',
  err: 'An error occurred.'
};

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');
let pageSize = 30;
const initialPageSize = 30;
const subsequentPageSize = 10;
const loadMoreButton = document.getElementById('load-more-btn');
let allEmojis = [];
let filteredEmojis = [];
let currentIndex = 0;
let favorites = [];
let collectionSortAsc = true;
let favoritesSortAsc = true;

function loadFavorites() {
  const favs = localStorage.getItem('favorites');
  favorites = favs ? JSON.parse(favs) : [];
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

const setResultsContent = (content) => {
  resultsContainer.innerHTML = content;
};

const createEmojiCard = (emojiObj, isFavorite = false, onClick) => {
  const card = document.createElement('div');
  card.classList.add('emoji-card');
  card.innerHTML = `
    <div class="emoji-card-header">
      <h3>${emojiObj.name}</h3>
      <p><strong>Category:</strong> ${emojiObj.category}</p>
    </div>
    <div class="emoji-card-image" style="font-size:2rem;">
      ${emojiObj.htmlCode[0]}
    </div>
    <i class="${isFavorite ? 'fa-solid fa-heart remove-fav-btn' : 'fa-regular fa-heart add-fav-btn'}" title="${isFavorite ? 'Remove Favorite' : 'Add to Favorites'}"></i>
  `;
  card.querySelector(isFavorite ? '.remove-fav-btn' : '.add-fav-btn')
    .addEventListener('click', onClick);
  return card;
};

const renderEmojis = (emojiArray, reset = false) => {
  if (reset) {
    resultsContainer.innerHTML = '';
    currentIndex = 0;
    pageSize = initialPageSize;
  }
  const nextBatch = emojiArray.slice(currentIndex, currentIndex + pageSize);
  nextBatch.forEach(emojiObj => {
    const card = createEmojiCard(emojiObj, false, () => addToFavorites(emojiObj));
    resultsContainer.appendChild(card);
  });
  currentIndex += pageSize;
  pageSize = subsequentPageSize;
  if (currentIndex < emojiArray.length) {
    loadMoreButton.style.display = 'block';
  } else {
    loadMoreButton.style.display = 'none';
  }
  updateCategoryTotals();
};

const loadAllEmojis = async () => {
  setResultsContent(messages.loading);
  try {
    const res = await fetch(apiBaseUrl);
    allEmojis = await res.json();
    filteredEmojis = allEmojis;
    renderEmojis(filteredEmojis, true);
  } catch (err) {
    console.error(err);
    setResultsContent(messages.err);
  }
};

const fetchAllEmojis = async () => {
  if (!allEmojis.length) {
    const res = await fetch(apiBaseUrl);
    allEmojis = await res.json();
  }
};

const performSearch = async () => {
  const query = searchInput.value.trim().toLowerCase();
  setResultsContent(messages.loading);
  try {
    await fetchAllEmojis();
    filteredEmojis = allEmojis.filter(e => e.name.toLowerCase().includes(query));
    if (filteredEmojis.length === 0) {
      setResultsContent(messages.noResults);
      loadMoreButton.style.display = 'none';
      return;
    }
    renderEmojis(filteredEmojis, true);
  } catch (err) {
    console.error(err);
    setResultsContent(messages.err);
    loadMoreButton.style.display = 'none';
  }
};

loadMoreButton.addEventListener('click', () => {
  renderEmojis(filteredEmojis);
});

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});

function renderFavorites() {
  const favoritesDiv = document.getElementById('favorites');
  favoritesDiv.innerHTML = '';
  favorites.forEach((emoji, idx) => {
    const card = createEmojiCard(emoji, true, () => removeFromFavorites(idx));
    favoritesDiv.appendChild(card);
  });
  updateCategoryTotals();
}

function addToFavorites(emojiObj) {
  filteredEmojis = filteredEmojis.filter(e =>
    !(e.name === emojiObj.name && e.htmlCode[0] === emojiObj.htmlCode[0])
  );
  if (!favorites.some(e => e.name === emojiObj.name && e.htmlCode[0] === emojiObj.htmlCode[0])) {
    favorites.push(emojiObj);
    saveFavorites();
  }
  renderEmojis(filteredEmojis, true);
  renderFavorites();
}

function removeFromFavorites(index) {
  const [removed] = favorites.splice(index, 1);
  if (!filteredEmojis.some(e => e.name === removed.name && e.htmlCode[0] === removed.htmlCode[0])) {
    filteredEmojis.unshift(removed);
  }
  saveFavorites();
  renderEmojis(filteredEmojis, true);
  renderFavorites();
}

function sortCollection() {
  filteredEmojis.sort((a, b) => {
    if (collectionSortAsc) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  renderEmojis(filteredEmojis, true);
}

function sortFavorites() {
  favorites.sort((a, b) => {
    if (favoritesSortAsc) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  renderFavorites();
}

document.getElementById('sort-results-btn').addEventListener('click', () => {
  collectionSortAsc = !collectionSortAsc;
  document.getElementById('sort-results-btn').textContent = collectionSortAsc ? 'Sort Collection A-Z' : 'Sort Collection Z-A';
  sortCollection();
});

document.getElementById('sort-favorites-btn').addEventListener('click', () => {
  favoritesSortAsc = !favoritesSortAsc;
  document.getElementById('sort-favorites-btn').textContent = favoritesSortAsc ? 'Sort Favorites A-Z' : 'Sort Favorites Z-A';
  sortFavorites();
});

function updateCategoryTotals() {
  const collectionCategories = new Set(filteredEmojis.map(e => e.category));
  const favoritesCategories = new Set(favorites.map(e => e.category));
  document.getElementById('collection-category-total').textContent = `Unique Categories: ${collectionCategories.size}`;
  document.getElementById('favorites-category-total').textContent = `Unique Categories: ${favoritesCategories.size}`;
}

document.addEventListener('DOMContentLoaded', function() {
  loadAllEmojis();
  loadFavorites();
  renderFavorites();
});
