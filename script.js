const sheetURL1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTo8ua4UreD9MUP4CI6OOXkt8LeagGX9w85veJfgi9DKJnHc2-dbCMvq5cx8DtlUO0YcV5RMPzcJ_KG/pub?output=csv";
const sheetURL2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv";
const sheetURL3 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UTNOg8d2LIrCU8A9ebfkYOMV2V3E7egroQgliVc4v6mp7Xi9fdmPaxN3k3YUmeW123C8UvwdiNmy/pub?output=csv";
const sheetURL4 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-tRe4QAkAIideMvvWDNWq2Aj_Nx6m4QG9snhFkpqqOGX8gU09X6uUQdkfuOj9yLIybn0iPIFoZbK-/pub?output=csv";
const sheetURL5 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv";
const sheetURL6 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgrPlpxYaFJdMcgf_-UT0hA4u-uzsbXlgOwVaI2ox9S44XPXySHiNogkYfkno84Ur5V0oCMet0thHp/pub?output=csv";
const sheetURL7 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5j1OVFnwB19xVA3ZVM46C8tNKvGHimyElwIAgMFDzurSEFA0m_8iHBIvD1_TKbtlfWw2MaDAirm47/pub?output=csv";

let jordanPosts = [];
let objectsIndex = [];
let allPosts = [];
let photographers = [];
let stickersIndex = [];
let articlesIndex = [];
let photosIndex = [];
let displayLimit = 10;
let currentFilter = "all";
let currentSort = "date-newest";
let savedPosts = JSON.parse(localStorage.getItem('satchelSaved') || '[]');
let searchQuery = "";
let viewHistory = JSON.parse(localStorage.getItem('satchelHistory') || '[]');
let currentView = "feed";

function toggleMobileMenu() {
  document.querySelector('.left-sidebar').classList.toggle('mobile-open');
  document.body.classList.toggle('menu-open');
}

function closeMobileMenuOnClick() {
  if (window.innerWidth <= 768) {
    document.querySelector('.left-sidebar').classList.remove('mobile-open');
    document.body.classList.remove('menu-open');
  }
}

function normalizeDate(dateStr) {
  if (!dateStr) return '';
  dateStr = dateStr.trim();
  
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }
  
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
  }
  
  if (/^\d{4}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[1].padStart(2, '0')}/01/${parts[0]}`;
  }
  
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
  }
  
  if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[1].padStart(2, '0')}/01/${parts[0]}`;
  }
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    }
  } catch (e) {}
  
  return dateStr;
}

function getCollectionIcon(collection) {
  const icons = {
    'collection1': 'newspaper',
    'collection2': 'pencil',
    'collection4': 'sticker',
    'photographer': 'users',
    'objects': 'box',
    'jordan': 'camera',
    'photos': 'image'
  };
  return icons[collection] || 'file';
}

function savePost(postUrl) {
  if (savedPosts.includes(postUrl)) {
    savedPosts = savedPosts.filter(url => url !== postUrl);
  } else {
    savedPosts.push(postUrl);
  }
  localStorage.setItem('satchelSaved', JSON.stringify(savedPosts));
  document.getElementById('countSaved').textContent = savedPosts.length;
  render();
}

function sharePost(post) {
  if (navigator.share) {
    navigator.share({
      title: post.title,
      text: `Check out this article: ${post.title}`,
      url: post.url
    }).catch(err => {
      if (err.name !== 'AbortError') {
        copyToClipboard(post.url);
      }
    });
  } else {
    copyToClipboard(post.url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
  });
}

function formatCommentTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function goToAllPosts() {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
  currentFilter = "all";
  currentView = "feed";
  searchQuery = "";
  document.getElementById('searchBox').value = "";
  displayLimit = 10;
  closeMobileMenuOnClick();
  render();
}

function randomPhotographer() {
  if (photographers.length === 0) return;
  const random = photographers[Math.floor(Math.random() * photographers.length)];
  window.open(random.website, '_blank');
  addToHistory({
    url: random.website,
    title: random.name,
    image: ''
  });
}

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
  document.getElementById('stickerFullscreenLocation').textContent = item.location || '';
  document.getElementById('stickerFullscreenMedium').textContent = item.notes || '';
  document.getElementById('stickerFullscreenArtist').textContent = '';
  
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
      
      filtered = [...filtered, ...matchingPhotographers, ...matchingStickers];
    }
  }
  
  return filtered;
}
