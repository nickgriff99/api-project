fetch('https://emojihub.yurace.pro/api/all')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

const apiBaseUrl = 'https://emojihub.yurace.pro/api/all';
const messages = {
  LOADING: 'Loading...',
  NO_RESULTS: 'No results found.',
  ERROR: 'An error occurred.'
};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

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

const loadAllEmojis = async () => {
  setResultsContent(messages.LOADING);
  try {
    const res = await fetch(apiBaseUrl);
    const emojis = await res.json();

    resultsContainer.innerHTML = '';
    emojis.slice(0, 30).forEach(emojiObj => {
      const card = createEmojiCard(emojiObj);
      resultsContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    setResultsContent(messages.ERROR);
  }
};

const performSearch = async () => {
  const query = searchInput.value.trim().toLowerCase();
  setResultsContent(messages.LOADING);
  try {
    const res = await fetch(apiBaseUrl);
    const emojis = await res.json();
    const filtered = emojis.filter(e => e.name.toLowerCase().includes(query));
    if (filtered.length === 0) {
      setResultsContent(messages.NO_RESULTS);
      return;
    }
    resultsContainer.innerHTML = '';
    filtered.forEach(emojiObj => {
      const card = createEmojiCard(emojiObj);
      resultsContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    setResultsContent(messages.ERROR);
  }
};

window.addEventListener('DOMContentLoaded', loadAllEmojis);
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});
