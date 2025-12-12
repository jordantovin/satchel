// Fullscreen modal functions
function openStickerFullscreen(item) {
  document.getElementById('stickerFullscreenImage').src = item.image;
  
  if (item.collection === 'collection4') {
    document.getElementById('stickerFullscreenDate').textContent = item.date;
    document.getElementById('stickerFullscreenLocation').textContent = item.location;
    document.getElementById('stickerFullscreenMedium').textContent = item.medium;
    document.getElementById('stickerFullscreenArtist').textContent = item.artist || 'Unknown';
  }
  
  document.getElementById('stickerFullscreen').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openObjectFullscreen(item) {
  document.getElementById('stickerFullscreenImage').src = item.image;
  document.getElementById('stickerFullscreenDate').textContent = item.date;
  document.getElementById('stickerFullscreenLocation').textContent = item.text;
  document.getElementById('stickerFullscreenMedium').textContent = "";
  document.getElementById('stickerFullscreenArtist').textContent = "";
  
  document.getElementById('stickerFullscreen').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openPhotoFullscreen(item) {
  document.getElementById('stickerFullscreenImage').src = item.image;
  document.getElementById('stickerFullscreenDate').textContent = item.date;
  document.getElementById('stickerFullscreenLocation').textContent = item.photographer;
  document.getElementById('stickerFullscreenMedium').textContent = item.text || "";
  document.getElementById('stickerFullscreenArtist').textContent = "";
  
  document.getElementById('stickerFullscreen').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeStickerFullscreen(event) {
  if (event) {
    event.stopPropagation();
  }
  document.getElementById('stickerFullscreen').classList.remove('active');
  document.body.style.overflow = '';
}

// History management
function addToHistory(post) {
  viewHistory = viewHistory.filter(item => item.url !== post.url);
  
  viewHistory.unshift({
    url: post.url,
    title: post.title,
    image: post.image,
    timestamp: Date.now()
  });
  
  viewHistory = viewHistory.slice(0, 20);
  
  localStorage.setItem('satchelHistory', JSON.stringify(viewHistory));
  
  updateHistory();
}

function updateHistory() {
  const historyList = document.getElementById('historyList');
  
  if (viewHistory.length === 0) {
    historyList.innerHTML = `
      <div class="no-history">
        <i data-lucide="clock" style="width: 32px; height: 32px; margin: 0 auto 8px; display: block; color: #ccc;"></i>
        <div>No reading history yet</div>
      </div>
    `;
  } else {
    historyList.innerHTML = viewHistory.map(item => {
      const hasImage = item.image && item.image.trim() !== '';
      
      if (hasImage) {
        return `
          <div class="history-item" onclick="window.open('${item.url}', '_blank')">
            <div class="history-thumbnail-wrapper">
              <img class="history-thumbnail" src="${item.image}" alt="${item.title}">
            </div>
            <div class="history-info">
              <div class="history-title">${item.title}</div>
              <div class="history-time">${formatCommentTime(item.timestamp)}</div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="history-item" onclick="window.open('${item.url}', '_blank')">
            <div class="history-thumbnail-wrapper">
              <div class="history-thumbnail circle" style="background: #1c1c1c; display: flex; align-items: center; justify-content: center; color: white;">
                <i data-lucide="users" style="width: 20px; height: 20px;"></i>
              </div>
            </div>
            <div class="history-info">
              <div class="history-title">${item.title}</div>
              <div class="history-time">${formatCommentTime(item.timestamp)}</div>
            </div>
          </div>
        `;
      }
    }).join('');
  }
  
  lucide.createIcons();
}

function clearHistory() {
  if (confirm('Are you sure you want to clear your reading history?')) {
    viewHistory = [];
    localStorage.setItem('satchelHistory', JSON.stringify(viewHistory));
    updateHistory();
  }
}

// Sorting and filtering functions
function sortPosts(arr) {
  let sorted = [...arr];
  
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    
    const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = parseInt(slashMatch[1], 10) - 1;
      const day = parseInt(slashMatch[2], 10);
      const year = parseInt(slashMatch[3], 10);
      return new Date(year, month, day);
    }
    
    return new Date(dateStr);
  };
  
  if (currentSort === "date-oldest") {
    sorted.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  } else if (currentSort === "date-newest") {
    sorted.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  } else if (currentSort === "title-az") {
    sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (currentSort === "title-za") {
    sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  } else if (currentSort === "shuffle") {
    const stickers = sorted.filter(p => p.collection === 'collection4');
    const otherPosts = sorted.filter(p => p.collection !== 'collection4');
    
    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    const limitedStickers = shuffleArray([...stickers]).slice(0, Math.floor(Math.random() * 4) + 5);
    
    sorted = shuffleArray([...otherPosts, ...limitedStickers]);
  }
  
  return sorted;
}

function filterPosts(arr) {
  let filtered = arr;
  
  if (currentFilter === "saved") {
    filtered = filtered.filter(p => savedPosts.includes(p.url));
  } else if (currentFilter !== "all") {
    filtered = filtered.filter(p => p.collection === currentFilter);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    
    filtered = filtered.filter(post => {
      return Object.values(post).some(value => {
        return value && typeof value === 'string' && value.toLowerCase().includes(query);
      });
    });
    
    if (currentFilter === "all") {
      const matchingPhotographers = photographers.filter(p => {
        return p.name.toLowerCase().includes(query) || 
               p.firstName.toLowerCase().includes(query) ||
               p.lastName.toLowerCase().includes(query) ||
               p.website.toLowerCase().includes(query);
      }).map(p => ({
        collection: "photographer",
        collectionName: "Photographers",
        title: p.name,
        url: p.website,
        image: '',
        date: p.dateAdded,
        noImage: true
      }));
      
      const matchingStickers = stickersIndex.filter(s => {
        return Object.values(s).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      }).map(s => ({
        collection: "collection4",
        collectionName: "Stickers",
        title: s.location || 'Sticker',
        url: s.image,
        image: s.image,
        date: s.date,
        medium: s.medium,
        location: s.location,
        artist: s.artist
      }));
      
      const matchingPhotos = photosIndex.filter(p => {
        return Object.values(p).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      }).map(p => ({
        collection: "photos",
        collectionName: "Photos",
        title: p.photographer,
        url: p.link,
        image: p.link,
        date: p.date,
        text: p.note,
        photographer: p.photographer
      }));
      
      filtered = [...filtered, ...matchingPhotographers, ...matchingStickers, ...matchingPhotos];
    }
  }
  
  return filtered;
}
