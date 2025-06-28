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

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');
let allEmojis = [];
let filteredEmojis = [];
let currentIndex = 0;
const pageSize = 30;
const loadMoreButton = document.getElementById('loadMoreButton');

const setResultsContent = (content) => {
  resultsContainer.innerHTML = content;
};

const createEmojiCard = (emojiObj) => {
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
  `;
  return card;
};

const renderEmojis = (emojiArray, reset = false) => {
  if (reset) {
    resultsContainer.innerHTML = '';
    currentIndex = 0;
  }
  const nextBatch = emojiArray.slice(currentIndex, currentIndex + pageSize);
  nextBatch.forEach(emojiObj => {
    const card = createEmojiCard(emojiObj);
    resultsContainer.appendChild(card);
  });
  currentIndex += pageSize;
  if (currentIndex < emojiArray.length) {
    loadMoreButton.style.display = 'block';
  } else {
    loadMoreButton.style.display = 'none';
  }
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

window.addEventListener('DOMContentLoaded', loadAllEmojis);
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});
