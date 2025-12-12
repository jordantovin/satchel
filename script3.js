// Photographers Index rendering
function renderPhotographersIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Photographers</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn active" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
        <button class="sort-btn" data-sort="latest">Latest</button>
        <button class="sort-btn" data-sort="oldest">Oldest</button>
      </div>
    </div>
    <div class="index-search">
      <div class="index-search-wrapper">
        <input type="text" id="photographerSearch" placeholder="Search photographers by name..." />
        <button class="random-btn" onclick="randomPhotographer()">Random</button>
      </div>
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedPhotographers = [...photographers].sort((a, b) => a.lastName.localeCompare(b.lastName));
  let currentPhotographerSort = 'az';
  
  const listContainer = document.createElement("div");
  listContainer.id = "photographerList";
  indexContainer.appendChild(listContainer);
  
  feed.appendChild(indexContainer);
  
  renderPhotographerList(sortedPhotographers, listContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentPhotographerSort = this.dataset.sort;
      
      if (currentPhotographerSort === 'az') {
        sortedPhotographers = [...photographers].sort((a, b) => a.lastName.localeCompare(b.lastName));
      } else if (currentPhotographerSort === 'za') {
        sortedPhotographers = [...photographers].sort((a, b) => b.lastName.localeCompare(a.lastName));
      } else if (currentPhotographerSort === 'latest') {
        sortedPhotographers = [...photographers].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      } else if (currentPhotographerSort === 'oldest') {
        sortedPhotographers = [...photographers].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      }
      
      const query = document.getElementById('photographerSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedPhotographers.filter(p => p.name.toLowerCase().includes(query));
        renderPhotographerList(filtered, listContainer);
      } else {
        renderPhotographerList(sortedPhotographers, listContainer);
      }
    });
  });
  
  document.getElementById('photographerSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderPhotographerList(sortedPhotographers, listContainer);
    } else {
      const filtered = sortedPhotographers.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.website.toLowerCase().includes(query) ||
        (p.type && p.type.toLowerCase().includes(query)) ||
        (p.class && p.class.toLowerCase().includes(query)) ||
        (p.why && p.why.toLowerCase().includes(query)) ||
        (p.what && p.what.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query))
      );
      renderPhotographerList(filtered, listContainer);
    }
  });
  
  lucide.createIcons();
}

function renderPhotographerList(photographersList, container) {
  container.innerHTML = '';
  
  if (photographersList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No photographers found</div>';
    return;
  }
  
  const grouped = {};
  photographersList.forEach(p => {
    const letter = p.lastName.charAt(0).toUpperCase();
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(p);
  });
  
  Object.keys(grouped).sort().forEach(letter => {
    const section = document.createElement("div");
    section.className = "alphabet-section";
    
    const letterHeader = document.createElement("div");
    letterHeader.className = "alphabet-letter";
    letterHeader.textContent = letter;
    section.appendChild(letterHeader);
    
    const grid = document.createElement("div");
    grid.className = "photographer-grid";
    
    grouped[letter].forEach(photographer => {
      const link = document.createElement("a");
      link.className = "photographer-link";
      link.href = photographer.website;
      link.target = "_blank";
      link.textContent = photographer.name.toLowerCase();
      link.onclick = (e) => {
        addToHistory({
          url: photographer.website,
          title: photographer.name,
          image: ''
        });
      };
      grid.appendChild(link);
    });
    
    section.appendChild(grid);
    container.appendChild(section);
  });
}

// Stickers Index rendering
function renderStickersIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Stickers</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
        <button class="sort-btn active" data-sort="latest">Latest</button>
        <button class="sort-btn" data-sort="oldest">Oldest</button>
      </div>
    </div>
    <div class="index-search">
      <input type="text" id="stickerSearch" placeholder="Search stickers by location, medium, or artist..." />
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedStickers = [...stickersIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentStickerSort = 'latest';
  
  const gridContainer = document.createElement("div");
  gridContainer.id = "stickerGrid";
  indexContainer.appendChild(gridContainer);
  
  feed.appendChild(indexContainer);
  
  renderStickerGrid(sortedStickers, gridContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentStickerSort = this.dataset.sort;
      
      if (currentStickerSort === 'az') {
        sortedStickers = [...stickersIndex].sort((a, b) => a.location.localeCompare(b.location));
      } else if (currentStickerSort === 'za') {
        sortedStickers = [...stickersIndex].sort((a, b) => b.location.localeCompare(a.location));
      } else if (currentStickerSort === 'latest') {
        sortedStickers = [...stickersIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (currentStickerSort === 'oldest') {
        sortedStickers = [...stickersIndex].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      const query = document.getElementById('stickerSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedStickers.filter(s => {
          return Object.values(s).some(value => {
            return value && typeof value === 'string' && value.toLowerCase().includes(query);
          });
        });
        renderStickerGrid(filtered, gridContainer);
      } else {
        renderStickerGrid(sortedStickers, gridContainer);
      }
    });
  });
  
  document.getElementById('stickerSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderStickerGrid(sortedStickers, gridContainer);
    } else {
      const filtered = sortedStickers.filter(s => {
        return Object.values(s).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      });
      renderStickerGrid(filtered, gridContainer);
    }
  });
  
  lucide.createIcons();
}

function renderStickerGrid(stickersList, container) {
  container.innerHTML = '';
  
  if (stickersList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No stickers found</div>';
    return;
  }
  
  const grid = document.createElement("div");
  grid.className = "stickers-grid";
  
  stickersList.forEach(sticker => {
    const item = document.createElement("div");
    item.className = "sticker-grid-item";
    item.onclick = () => {
      openStickerFullscreen({
        collection: 'collection4',
        image: sticker.image,
        date: sticker.date,
        location: sticker.location,
        medium: sticker.medium,
        artist: sticker.artist
      });
    };
    
    item.innerHTML = `
      <img class="sticker-grid-image" src="${sticker.image}" alt="${sticker.location_card}">
      <div class="sticker-grid-overlay">
        <div><strong>Date:</strong> ${sticker.date}</div>
        <div><strong>Location:</strong> ${sticker.location_card}</div>
        <div><strong>Medium:</strong> ${sticker.medium}</div>
        <div><strong>Artist:</strong> ${sticker.artist}</div>
      </div>
    `;
    
    grid.appendChild(item);
  });
  
  container.appendChild(grid);
}
