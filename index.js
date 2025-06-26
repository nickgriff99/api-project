const apiBaseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
const messages = {
  LOADING: 'Loading...',
  NO_RESULTS: 'No results found.',
  ERROR: 'An error occurred.'
};
const popularObjectIds = [
  436121, 437853, 436535, 436839, 437329, 436524, 436453, 436532, 436528, 436529,
  436530, 436531, 436533, 436534, 436536, 436537, 436538, 436539, 436540, 436541,
  436542, 436543, 436544, 436545, 436546, 436547, 436548, 436549, 436550, 436551
];

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${apiBaseUrl}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

const setResultsContent = (content) => {
  resultsContainer.innerHTML = content;
};

const createArtCard = (obj) => {
  const artCard = document.createElement('div');
  artCard.classList.add('art-card');
  artCard.innerHTML = `
    <div class="art-card-header">
      <h3>${obj.title}</h3>
      <p><strong>Artist:</strong> ${obj.artistDisplayName || 'Unknown'}</p>
    </div>
    <div class="art-card-image">
      <img src="${obj.primaryImageSmall}" alt="${obj.title}">
    </div>
  `;
  return artCard;
};

const loadPopularArtworks = async () => {
  setResultsContent(messages.LOADING);
  try {
    const objectDataPromises = popularObjectIds.map(id =>
      fetch(buildApiUrl(`objects/${id}`)).then(res => res.json())
    );
    const objects = await Promise.all(objectDataPromises);

    resultsContainer.innerHTML = '';
    objects.forEach(obj => {
      const artCard = createArtCard(obj);
      resultsContainer.appendChild(artCard);
    });

  } catch (err) {
    console.error(err);
    setResultsContent(messages.ERROR);
  }
};

window.addEventListener('DOMContentLoaded', loadPopularArtworks);

const performSearch = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  setResultsContent(messages.LOADING);
  try {
    const searchRes = await fetch(buildApiUrl('search', { q: query }));
    const searchData = await searchRes.json();

    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      setResultsContent(messages.NO_RESULTS);
      return;
    }    const topResults = searchData.objectIDs.slice(0, 30);
    const objectDataPromises = topResults.map(id =>
      fetch(buildApiUrl(`objects/${id}`)).then(res => res.json())
    );
    const objects = await Promise.all(objectDataPromises);

    resultsContainer.innerHTML = '';
    objects.forEach(obj => {
      const artCard = createArtCard(obj);
      resultsContainer.appendChild(artCard);
    });

  } catch (err) {
    console.error(err);
    setResultsContent(messages.ERROR);
  }
};

searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});
