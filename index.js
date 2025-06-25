const API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
const MESSAGES = {
  LOADING: 'Loading...',
  NO_RESULTS: 'No results found.',
  ERROR: 'An error occurred.'
};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
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
    <h3>${obj.title}</h3>
    <p><strong>Artist:</strong> ${obj.artistDisplayName || 'Unknown'}</p>
    <img src="${obj.primaryImageSmall}" alt="${obj.title}">
  `;
  return artCard;
};

const performSearch = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  setResultsContent(MESSAGES.LOADING);
  try {
    const searchRes = await fetch(buildApiUrl('search', { q: query }));
    const searchData = await searchRes.json();

    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      setResultsContent(MESSAGES.NO_RESULTS);
      return;
    }    const topResults = searchData.objectIDs.slice(0, 9);
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
    setResultsContent(MESSAGES.ERROR);
  }
};

searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});
