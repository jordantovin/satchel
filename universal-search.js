// ============================================================================
// UNIVERSAL SEARCH MODULE - FIXED VERSION
// This matches your actual data structures from script.js
// ============================================================================

let universalSearchActive = false;
let universalSearchResults = [];
let blogDataLoaded = false;

// Initialize universal search functionality
function initUniversalSearch() {
  const searchInput = document.getElementById('topSearchInput');
  
  if (searchInput) {
    console.log('Initializing universal search...');
    
    // Remove the existing event listener
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Add new event listener for universal search
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      console.log('Search input:', query);
      
      if (query.length > 0) {
        performUniversalSearch(query);
      } else {
        clearUniversalSearch();
      }
    });
  }
  
  // Load blog data in background
  loadAllBlogData();
}

// Load all blog data proactively
async function loadAllBlogData() {
  if (blogDataLoaded) return;
  
  try {
    console.log('Loading blog data for search...');
    
    // Check if blog functions exist
    if (typeof loadBlogPosts === 'function') {
      if (typeof blogPostsData === 'undefined' || blogPostsData.length === 0) {
        await loadBlogPosts();
      }
    }
    
    if (typeof loadInspoPosts === 'function') {
      if (typeof inspoPostsData === 'undefined' || inspoPostsData.length === 0) {
        await loadInspoPosts();
      }
    }
    
    if (typeof loadFieldNotes === 'function') {
      if (typeof fieldNotesData === 'undefined' || fieldNotesData.length === 0) {
        await loadFieldNotes();
      }
    }
    
    blogDataLoaded = true;
    console.log('Blog data loaded for search');
  } catch (error) {
    console.error('Error loading blog data:', error);
  }
}

// Perform search across ALL data sources
function performUniversalSearch(query) {
  universalSearchActive = true;
  universalSearchResults = [];
  
  const lowerQuery = query.toLowerCase();
  
  console.log('Searching for:', lowerQuery);
  console.log('Available data:', {
    objects: typeof allData !== 'undefined' ? allData.objects?.length : 0,
    articles: typeof allData !== 'undefined' ? allData.articles?.length : 0,
    pictures: typeof allData !== 'undefined' ? allData.pictures?.length : 0,
    photographers: typeof photographersData !== 'undefined' ? photographersData.length : 0,
    blogPosts: typeof blogPostsData !== 'undefined' ? blogPostsData.length : 0,
    inspo: typeof inspoPostsData !== 'undefined' ? inspoPostsData.length : 0,
    fieldNotes: typeof fieldNotesData !== 'undefined' ? fieldNotesData.length : 0
  });
  
  // Search Objects (using your actual data structure)
  if (typeof allData !== 'undefined' && allData.objects && allData.objects.length > 0) {
    allData.objects.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['title', 'date', 'medium', 'artist', 'location_card', 'location_overlay', 'keywords', 'note', 'source'])) {
        universalSearchResults.push({
          type: 'object',
          data: item,
          source: 'Objects'
        });
      }
    });
  }
  
  // Search Articles
  if (typeof allData !== 'undefined' && allData.articles && allData.articles.length > 0) {
    allData.articles.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['date', 'source', 'src'])) {
        universalSearchResults.push({
          type: 'article',
          data: item,
          source: 'Articles'
        });
      }
    });
  }
  
  // Search Pictures
  if (typeof allData !== 'undefined' && allData.pictures && allData.pictures.length > 0) {
    allData.pictures.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['date', 'photographer', 'note'])) {
        universalSearchResults.push({
          type: 'picture',
          data: item,
          source: 'Pictures'
        });
      }
    });
  }
  
  // Search Photographers (using your actual data structure with firstName/lastName)
  if (typeof photographersData !== 'undefined' && photographersData.length > 0) {
    photographersData.forEach(item => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const website = (item.website || '').toLowerCase();
      const classField = (item.Class || item.class || '').toLowerCase();
      
      if (fullName.includes(lowerQuery) || website.includes(lowerQuery) || classField.includes(lowerQuery)) {
        universalSearchResults.push({
          type: 'photographer',
          data: item,
          source: item.Class || item.class || 'Names'
        });
      }
    });
  }
  
  // Search Blog Posts
  if (typeof blogPostsData !== 'undefined' && blogPostsData.length > 0) {
    blogPostsData.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['title', 'date', 'text'])) {
        universalSearchResults.push({
          type: 'blog-post',
          data: item,
          source: 'Blog Posts'
        });
      }
    });
  }
  
  // Search Inspo Posts
  if (typeof inspoPostsData !== 'undefined' && inspoPostsData.length > 0) {
    inspoPostsData.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['name', 'date', 'text', 'link'])) {
        universalSearchResults.push({
          type: 'inspo',
          data: item,
          source: 'Inspo'
        });
      }
    });
  }
  
  // Search Field Notes
  if (typeof fieldNotesData !== 'undefined' && fieldNotesData.length > 0) {
    fieldNotesData.forEach(item => {
      if (matchesQuery(item, lowerQuery, ['title', 'date', 'number'])) {
        universalSearchResults.push({
          type: 'field-note',
          data: item,
          source: 'Field Notes'
        });
      }
    });
  }
  
  console.log('Found', universalSearchResults.length, 'results');
  renderUniversalSearchResults();
}

// Helper function to check if item matches query
function matchesQuery(item, query, fields) {
  return fields.some(field => {
    const value = item[field];
    return value && value.toString().toLowerCase().includes(query);
  });
}

// Render universal search results in grid
function renderUniversalSearchResults() {
  const gallery = document.getElementById('gallery');
  const photographersContent = document.getElementById('photographersContent');
  const blogContent = document.getElementById('blogContent');
  const imageCount = document.getElementById('imageCount');
  
  console.log('Rendering', universalSearchResults.length, 'search results');
  
  // FORCE search view regardless of current mode
  photographersContent.classList.remove('active');
  blogContent.classList.remove('active');
  
  // Show gallery in search mode
  gallery.style.display = 'grid';
  gallery.className = ''; // Reset all classes
  
  // Clear gallery
  gallery.innerHTML = '';
  
  // Update count
  imageCount.textContent = `${universalSearchResults.length} results`;
  
  if (universalSearchResults.length === 0) {
    gallery.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; font-size: 18px;">No results found</div>';
    return;
  }
  
  // Render each result
  universalSearchResults.forEach(result => {
    const card = createSearchResultCard(result);
    gallery.appendChild(card);
  });
}

// Create a card for each search result
function createSearchResultCard(result) {
  const card = document.createElement('div');
  card.className = 'search-result-card';
  card.style.cssText = `
    background: #f9f9f9;
    border: 2px solid #000;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    min-height: 200px;
  `;
  
  // Source badge
  const sourceBadge = document.createElement('div');
  sourceBadge.textContent = result.source;
  sourceBadge.style.cssText = `
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.5px;
  `;
  card.appendChild(sourceBadge);
  
  // Content based on type
  switch(result.type) {
    case 'object':
      renderObjectSearchCard(card, result.data);
      break;
    case 'article':
      renderArticleSearchCard(card, result.data);
      break;
    case 'picture':
      renderPictureSearchCard(card, result.data);
      break;
    case 'photographer':
      renderPhotographerSearchCard(card, result.data);
      break;
    case 'blog-post':
      renderBlogPostSearchCard(card, result.data);
      break;
    case 'inspo':
      renderInspoSearchCard(card, result.data);
      break;
    case 'field-note':
      renderFieldNoteSearchCard(card, result.data);
      break;
  }
  
  // Hover effect
  card.addEventListener('mouseenter', () => {
    card.style.backgroundColor = '#fff';
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.backgroundColor = '#f9f9f9';
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  });
  
  return card;
}

// Card renderers for each type (using your actual data structure)
function renderObjectSearchCard(card, data) {
  if (data.src) {
    const img = document.createElement('img');
    img.src = data.src;
    img.style.cssText = 'width: 100%; height: 120px; object-fit: contain; margin-bottom: 8px; opacity: 0; transition: opacity 0.5s ease;';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    card.appendChild(img);
  }
  
  const title = document.createElement('div');
  title.textContent = data.title || data.location_card || 'Object';
  title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px; line-height: 1.3;';
  card.appendChild(title);
  
  const details = document.createElement('div');
  details.style.cssText = 'font-size: 12px; color: #666;';
  const detailParts = [];
  if (data.date) detailParts.push(data.date);
  if (data.medium) detailParts.push(data.medium);
  if (data.artist) detailParts.push(data.artist);
  details.textContent = detailParts.join(' • ');
  card.appendChild(details);
  
  if (data.src) {
    card.addEventListener('click', () => {
      const index = allData.objects.findIndex(p => p.src === data.src);
      if (index !== -1) {
        filteredImages = allData.objects;
        showOverlay(index);
      }
    });
  }
}

function renderArticleSearchCard(card, data) {
  if (data.photo) {
    const img = document.createElement('img');
    img.src = data.photo;
    img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
    card.appendChild(img);
  }
  
  const source = document.createElement('div');
  source.textContent = data.source || 'Article';
  source.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px;';
  card.appendChild(source);
  
  if (data.date) {
    const details = document.createElement('div');
    details.style.cssText = 'font-size: 12px; color: #666;';
    details.textContent = data.date;
    card.appendChild(details);
  }
  
  if (data.src) {
    const link = document.createElement('div');
    link.textContent = '→ Read article';
    link.style.cssText = 'font-size: 12px; color: #0066cc; margin-top: 8px;';
    card.appendChild(link);
    
    card.addEventListener('click', () => {
      window.open(data.src, '_blank');
    });
  }
}

function renderPictureSearchCard(card, data) {
  if (data.src) {
    const img = document.createElement('img');
    img.src = data.src;
    img.style.cssText = 'width: 100%; height: 120px; object-fit: contain; margin-bottom: 8px; opacity: 0; transition: opacity 0.5s ease;';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    card.appendChild(img);
  }
  
  const photographer = document.createElement('div');
  photographer.textContent = data.photographer || 'Picture';
  photographer.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px;';
  card.appendChild(photographer);
  
  if (data.date) {
    const details = document.createElement('div');
    details.style.cssText = 'font-size: 12px; color: #666;';
    details.textContent = data.date;
    card.appendChild(details);
  }
  
  if (data.note) {
    const note = document.createElement('div');
    note.textContent = data.note;
    note.style.cssText = 'font-size: 12px; color: #333; margin-top: 4px; line-height: 1.4;';
    card.appendChild(note);
  }
  
  if (data.src) {
    card.addEventListener('click', () => {
      const index = allData.pictures.findIndex(p => p.src === data.src);
      if (index !== -1) {
        filteredImages = allData.pictures;
        showOverlay(index);
      }
    });
  }
}

function renderPhotographerSearchCard(card, data) {
  const name = document.createElement('div');
  name.textContent = `${data.firstName} ${data.lastName}`;
  name.style.cssText = 'font-weight: bold; font-size: 18px; margin-bottom: 8px;';
  card.appendChild(name);
  
  if (data.website) {
    const website = document.createElement('div');
    website.textContent = data.website;
    website.style.cssText = 'font-size: 12px; color: #0066cc; text-decoration: underline; word-break: break-all;';
    card.appendChild(website);
    
    const visitLink = document.createElement('div');
    visitLink.textContent = '→ Visit website';
    visitLink.style.cssText = 'font-size: 12px; color: #0066cc; margin-top: 8px;';
    card.appendChild(visitLink);
    
    card.addEventListener('click', () => {
      window.open(data.website, '_blank');
    });
  }
}

function renderBlogPostSearchCard(card, data) {
  if (data.pictures) {
    const img = document.createElement('img');
    img.src = data.pictures;
    img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
    card.appendChild(img);
  }
  
  const title = document.createElement('div');
  title.textContent = data.title || 'Blog Post';
  title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px; line-height: 1.3;';
  card.appendChild(title);
  
  if (data.date) {
    const date = document.createElement('div');
    date.textContent = data.date;
    date.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 4px;';
    card.appendChild(date);
  }
  
  if (data.text) {
    const text = document.createElement('div');
    text.textContent = data.text.substring(0, 100) + (data.text.length > 100 ? '...' : '');
    text.style.cssText = 'font-size: 12px; color: #333; line-height: 1.4;';
    card.appendChild(text);
  }
  
  const viewPost = document.createElement('div');
  viewPost.textContent = '→ View post';
  viewPost.style.cssText = 'font-size: 12px; color: #0066cc; margin-top: 8px;';
  card.appendChild(viewPost);
  
  card.addEventListener('click', () => {
    document.getElementById('modeSelector').value = 'blog';
    switchMode();
    showBlogSection('posts');
  });
}

function renderInspoSearchCard(card, data) {
  const name = document.createElement('div');
  name.textContent = data.name || 'Inspo';
  name.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px;';
  card.appendChild(name);
  
  if (data.date) {
    const date = document.createElement('div');
    date.textContent = data.date;
    date.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 4px;';
    card.appendChild(date);
  }
  
  if (data.text) {
    const text = document.createElement('div');
    text.textContent = data.text.substring(0, 80) + (data.text.length > 80 ? '...' : '');
    text.style.cssText = 'font-size: 12px; color: #333; line-height: 1.4; margin-bottom: 8px;';
    card.appendChild(text);
  }
  
  if (data.link) {
    const link = document.createElement('div');
    link.textContent = '→ View link';
    link.style.cssText = 'font-size: 12px; color: #0066cc;';
    card.appendChild(link);
    
    card.addEventListener('click', () => {
      window.open(data.link, '_blank');
    });
  }
}

function renderFieldNoteSearchCard(card, data) {
  if (data.image) {
    const img = document.createElement('img');
    img.src = data.image;
    img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
    card.appendChild(img);
  }
  
  const title = document.createElement('div');
  const titleText = data.number ? `${data.number} - ${data.title}` : data.title;
  title.textContent = titleText || 'Field Note';
  title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px; line-height: 1.3;';
  card.appendChild(title);
  
  if (data.date) {
    const date = document.createElement('div');
    date.textContent = data.date;
    date.style.cssText = 'font-size: 12px; color: #666;';
    card.appendChild(date);
  }
  
  if (data.url) {
    const link = document.createElement('div');
    link.textContent = '→ Read note';
    link.style.cssText = 'font-size: 12px; color: #0066cc; margin-top: 8px;';
    card.appendChild(link);
    
    card.addEventListener('click', () => {
      window.open(data.url, '_blank');
    });
  }
}

// Clear universal search and restore previous view
function clearUniversalSearch() {
  if (universalSearchActive) {
    console.log('Clearing universal search');
    universalSearchActive = false;
    universalSearchResults = [];
    
    const currentModeValue = document.getElementById('modeSelector').value;
    const currentIndexValue = document.getElementById('indexSelector').value;
    
    if (currentModeValue === 'blog') {
      document.getElementById('blogContent').classList.add('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('photographersContent').classList.remove('active');
    } else {
      document.getElementById('blogContent').classList.remove('active');
      
      if (currentIndexValue === 'photographers') {
        document.getElementById('photographersContent').classList.add('active');
        document.getElementById('gallery').style.display = 'none';
        if (typeof renderPhotographers === 'function') {
          renderPhotographers();
        }
      } else {
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'grid';
        if (typeof applyFilters === 'function') {
          applyFilters();
        }
      }
    }
  }
}
