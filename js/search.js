// search.js - FlexSearch client-side search handler
(function() {
  let searchIndex = new FlexSearch.Document({
    document: {
      id: "id",
      index: ["title", "content"],
      store: ["title", "url", "description"]
    }
  });

  let isIndexLoaded = false;

  async function loadSearchIndex() {
    if (isIndexLoaded) return;
    try {
      const response = await fetch('/search.json');
      const data = await response.json();
      data.forEach(item => searchIndex.add(item));
      isIndexLoaded = true;
    } catch (err) {
      console.error("Failed to load search index:", err);
    }
  }

  const searchInput = document.getElementById('site-search-input');
  const resultsList = document.getElementById('site-search-results');

  if (!searchInput || !resultsList) return;

  searchInput.addEventListener('focus', loadSearchIndex);
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    resultsList.innerHTML = '';

    if (!query) {
      resultsList.style.display = 'none';
      return;
    }

    if (!isIndexLoaded) {
      await loadSearchIndex();
    }

    const results = await searchIndex.searchAsync(query, { limit: 5 });
    
    const map = new Map();
    results.forEach(field => {
      field.result.forEach(id => map.set(id, searchIndex.get(id)));
    });

    // Handle case where no matches were found
    if (map.size === 0) {
      resultsList.innerHTML = `
        <div class="search-results-header">Search Results</div>
        <div class="search-no-results">No search results found</div>
      `;
      resultsList.style.display = 'block';
      return;
    }

    let html = '<div class="search-results-header">Search Results</div>';
    let index = 0;

    map.forEach(item => {
      const snippet = item.description ? item.description.substring(0, 90) + '...' : '';
      const altClass = index % 2 === 0 ? 'search-result-even' : 'search-result-odd';
      html += `
        <div class="search-result-item ${altClass}">
          <a href="${item.url}">
            <span class="search-result-title">${item.title}</span>
            ${snippet ? `<span class="search-result-snippet">${snippet}</span>` : ''}
          </a>
        </div>
      `;
      index++;
    });

    resultsList.innerHTML = html;
    resultsList.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-search-container')) {
      resultsList.style.display = 'none';
    }
  });
})();
