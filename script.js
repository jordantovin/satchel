const sheetURL1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTo8ua4UreD9MUP4CI6OOXkt8LeagGX9w85veJfgi9DKJnHc2-dbCMvq5cx8DtlUO0YcV5RMPzcJ_KG/pub?output=csv";
const sheetURL2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv";
const sheetURL3 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UTNOg8d2LIrCU8A9ebfkYOMV2V3E7egroQgliVc4v6mp7Xi9fdmPaxN3k3YUmeW123C8UvwdiNmy/pub?output=csv";
const sheetURL4 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-tRe4QAkAIideMvvWDNWq2Aj_Nx6m4QG9snhFkpqqOGX8gU09X6uUQdkfuOj9yLIybn0iPIFoZbK-/pub?output=csv";
const sheetURL5 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv";
const sheetURL6 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgrPlpxYaFJdMcgf_-UT0hA4u-uzsbXlgOwVaI2ox9S44XPXySHiNogkYfkno84Ur5V0oCMet0thHp/pub?output=csv";

let jordanPosts = [];
let objectsIndex = [];
let allPosts = [];
let photographers = [];
let stickersIndex = [];
let articlesIndex = [];
let displayLimit = 10;
let currentFilter = "all";
let currentSort = "date-newest";
let savedPosts = JSON.parse(localStorage.getItem('satchelSaved') || '[]');
let searchQuery = "";
let viewHistory = JSON.parse(localStorage.getItem('satchelHistory') || '[]');
let currentView = "feed";

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
    'jordan': 'bold'
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

function closeStickerFullscreen(event) {
  if (event) {
    event.stopPropagation();
  }
  document.getElementById('stickerFullscreen').classList.remove('active');
  document.body.style.overflow = '';
}

async function loadAllData() {
  try {
    const [res1, res2, res3, res4, res5, res6] = await Promise.all([
      fetch(sheetURL1),
      fetch(sheetURL2),
      fetch(sheetURL3),
      fetch(sheetURL4),
      fetch(sheetURL5),
      fetch(sheetURL6)
    ]);
    
    const [text1, text2, text3, text4, text5, text6] = await Promise.all([
      res1.text(),
      res2.text(),
      res3.text(),
      res4.text(),
      res5.text(),
      res6.text()
    ]);
    
    const parsed1 = Papa.parse(text1, { header: true }).data;
    const posts1 = parsed1.filter(r => r.src && r.photo).map(p => ({
      ...p,
      collection: "collection1",
      collectionName: "Articles",
      title: p.test,
      url: p.src,
      image: p.photo,
      date: normalizeDate(p.date)
    }));

    articlesIndex = parsed1.filter(r => r.src && r.photo).map(p => ({
      ...p,
      title: p.test,
      url: p.src,
      image: p.photo,
      date: normalizeDate(p.date)
    }));

    const parsed2 = Papa.parse(text2, { header: true }).data;
    const posts2 = parsed2.filter(r => r.image).map(p => ({
      ...p,
      collection: "collection2",
      collectionName: "Field Notes",
      title: p.title || p.url,
      url: p.url,
      image: p.image,
      date: normalizeDate(p.date)
    }));

    const parsed3 = Papa.parse(text3, { header: true }).data;
    photographers = parsed3.filter(r => r['First Name'] && r['Last Name'] && r.Website).map(p => ({
      firstName: p['First Name'],
      lastName: p['Last Name'],
      name: `${p['First Name']} ${p['Last Name']}`,
      website: p.Website,
      dateAdded: normalizeDate(p['Date Added'])
    }));

    const parsed4 = Papa.parse(text4, { header: true }).data;
    stickersIndex = parsed4.filter(r => r.src && r.date && r.location_card && r.medium).map(p => ({
      ...p,
      image: p.src,
      date: normalizeDate(p.date),
      location: p.location_card,
      medium: p.medium,
      artist: p.artist || 'Unknown'
    }));

    // Objects CSV
    const parsed5 = Papa.parse(text5, { header: true }).data;

    objectsIndex = parsed5
      .filter(r => r.Date && r.Text && r.Image)
      .map(o => ({
        date: normalizeDate(o.Date),
        text: o.Text,
        image: o.Image
      }));

    const posts5 = parsed5
      .filter(r => r.Date && r.Text && r.Image)
      .map(o => ({
        collection: "objects",
        collectionName: "Objects",
        title: o.Text,
        date: normalizeDate(o.Date),
        url: o.Image,
        image: o.Image,
        text: o.Text
      }));

    // Jordan Posts CSV
    const parsed6 = Papa.parse(text6, { header: true }).data;

    jordanPosts = parsed6
      .filter(r => r.Date && r.Title)
      .map(p => {
        const hasImage = p.Image && p.Image.trim() !== "";

        return {
          collection: "jordan",
          collectionName: "Jordan Posts",
          title: p.Title,
          date: normalizeDate(p.Date),
          text: p.Text || "",
          image: hasImage ? p.Image : "",
          url: hasImage ? p.Image : `jordan-${p.Date.replace(/\//g,'-')}-${p.Title.replace(/\s+/g,'_')}`
        };
      });

    const posts4 = parsed4.filter(r => r.src && r.date && r.location_card && r.medium).map(p => ({
      ...p,
      collection: "collection4",
      collectionName: "Stickers",
      title: p.location_card || 'Sticker',
      date: normalizeDate(p.date),
      url: p.src,
      image: p.src,
      medium: p.medium,
      location: p.location_card,
      artist: p.artist
    }));

    allPosts = [ ...posts1, ...posts2, ...posts4, ...posts5, ...jordanPosts ];
    
    document.getElementById('countAll').textContent = allPosts.length;
    document.getElementById('count1').textContent = posts1.length;
    document.getElementById('count2').textContent = posts2.length;
    document.getElementById('count3').textContent = photographers.length;
    document.getElementById('count4').textContent = posts4.length;
    document.getElementById('countStickersIndex').textContent = stickersIndex.length;
    document.getElementById('countArticlesIndex').textContent = articlesIndex.length;
    document.getElementById("countObjects").textContent = posts5.length;
    document.getElementById("countObjectsIndex").textContent = objectsIndex.length;

    updateHistory();
    document.getElementById('countSaved').textContent = savedPosts.length;

    lucide.createIcons();
    render();
  } catch (error) {
    console.error("Error loading data:", error);
  }
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
  
  if (currentSort === "date-oldest") {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === "date-newest") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
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
        p.name.toLowerCase().includes(query)
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

function renderArticlesIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Articles</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
        <button class="sort-btn active" data-sort="latest">Latest</button>
        <button class="sort-btn" data-sort="oldest">Oldest</button>
      </div>
    </div>
    <div class="index-search">
      <input type="text" id="articleSearch" placeholder="Search articles by title or date..." />
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedArticles = [...articlesIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentArticleSort = 'latest';
  
  const gridContainer = document.createElement("div");
  gridContainer.id = "articleGrid";
  indexContainer.appendChild(gridContainer);
  
  feed.appendChild(indexContainer);
  
  renderArticleGrid(sortedArticles, gridContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentArticleSort = this.dataset.sort;
      
      if (currentArticleSort === 'az') {
        sortedArticles = [...articlesIndex].sort((a, b) => a.title.localeCompare(b.title));
      } else if (currentArticleSort === 'za') {
        sortedArticles = [...articlesIndex].sort((a, b) => b.title.localeCompare(a.title));
      } else if (currentArticleSort === 'latest') {
        sortedArticles = [...articlesIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (currentArticleSort === 'oldest') {
        sortedArticles = [...articlesIndex].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      const query = document.getElementById('articleSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedArticles.filter(a => {
          return Object.values(a).some(value => {
            return value && typeof value === 'string' && value.toLowerCase().includes(query);
          });
        });
        renderArticleGrid(filtered, gridContainer);
      } else {
        renderArticleGrid(sortedArticles, gridContainer);
      }
    });
  });
  
  document.getElementById('articleSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderArticleGrid(sortedArticles, gridContainer);
    } else {
      const filtered = sortedArticles.filter(a => {
        return Object.values(a).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      });
      renderArticleGrid(filtered, gridContainer);
    }
  });
  
  lucide.createIcons();
}

function renderObjectsIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Objects</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
        <button class="sort-btn active" data-sort="latest">Latest</button>
        <button class="sort-btn" data-sort="oldest">Oldest</button>
      </div>
    </div>
    <div class="index-search">
      <input type="text" id="objectSearch" placeholder="Search objects by text or date..." />
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedObjects = [...objectsIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentObjectSort = 'latest';
  
  const gridContainer = document.createElement("div");
  gridContainer.id = "objectGrid";
  indexContainer.appendChild(gridContainer);
  
  feed.appendChild(indexContainer);
  
  renderObjectGrid(sortedObjects, gridContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentObjectSort = this.dataset.sort;
      
      if (currentObjectSort === 'az') {
        sortedObjects = [...objectsIndex].sort((a, b) => a.text.localeCompare(b.text));
      } else if (currentObjectSort === 'za') {
        sortedObjects = [...objectsIndex].sort((a, b) => b.text.localeCompare(a.text));
      } else if (currentObjectSort === 'latest') {
        sortedObjects = [...objectsIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (currentObjectSort === 'oldest') {
        sortedObjects = [...objectsIndex].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      const query = document.getElementById('objectSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedObjects.filter(o => {
          return Object.values(o).some(value => {
            return value && typeof value === 'string' && value.toLowerCase().includes(query);
          });
        });
        renderObjectGrid(filtered, gridContainer);
      } else {
        renderObjectGrid(sortedObjects, gridContainer);
      }
    });
  });
  
  document.getElementById('objectSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderObjectGrid(sortedObjects, gridContainer);
    } else {
      const filtered = sortedObjects.filter(o => {
        return Object.values(o).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      });
      renderObjectGrid(filtered, gridContainer);
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
      <img class="sticker-grid-image" src="${sticker.image}" alt="${sticker.location}">
      <div class="sticker-grid-overlay">
        <div><strong>Date:</strong> ${sticker.date}</div>
        <div><strong>Location:</strong> ${sticker.location}</div>
        <div><strong>Medium:</strong> ${sticker.medium}</div>
        <div><strong>Artist:</strong> ${sticker.artist}</div>
      </div>
    `;
    
    grid.appendChild(item);
  });
  
  container.appendChild(grid);
}

function renderArticleGrid(articlesList, container) {
  container.innerHTML = '';
  
  if (articlesList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No articles found</div>';
    return;
  }
  
  const grid = document.createElement("div");
  grid.className = "articles-grid";
  
  articlesList.forEach(article => {
    const item = document.createElement("a");
    item.className = "article-grid-item";
    item.href = article.url;
    item.target = "_blank";
    item.onclick = () => {
      addToHistory({
        url: article.url,
        title: article.title,
        image: article.image
      });
    };
    
    item.innerHTML = `
      <img class="article-grid-image" src="${article.image}" alt="${article.title}">
      <div class="article-grid-overlay">
        <div class="article-grid-title">${article.title}</div>
        <div class="article-grid-date">${article.date}</div>
      </div>
    `;
    
    grid.appendChild(item);
  });
  
  container.appendChild(grid);
}

function renderObjectGrid(objectsList, container) {
  container.innerHTML = '';
  
  if (objectsList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No objects found</div>';
    return;
  }
  
  const grid = document.createElement("div");
  grid.className = "stickers-grid";
  
  objectsList.forEach(obj => {
    const item = document.createElement("div");
    item.className = "sticker-grid-item";
    item.onclick = () => {
      openObjectFullscreen({
        collection: 'objects',
        image: obj.image,
        date: obj.date,
        text: obj.text
      });
    };
    
    item.innerHTML = `
      <img class="sticker-grid-image" src="${obj.image}" alt="${obj.text}">
      <div class="sticker-grid-overlay">
        <div><strong>Date:</strong> ${obj.date}</div>
        <div><strong>Text:</strong> ${obj.text}</div>
      </div>
    `;
    
    grid.appendChild(item);
  });
  
  container.appendChild(grid);
}

function render() {
  if (currentView === "photographers-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderPhotographersIndex();
    return;
  }
  
  if (currentView === "stickers-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderStickersIndex();
    return;
  }
  
  if (currentView === "articles-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderArticlesIndex();
    return;
  }
  
  if (currentView === "objects-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderObjectsIndex();
    return;
  }
  
  hideFullscreenToggle();
  
  document.querySelector('.sort-bar').style.display = 'flex';
  
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  const filtered = filterPosts(allPosts);
  const sorted = sortPosts(filtered);
  const visible = sorted.slice(0, displayLimit);

  if (searchQuery) {
    const searchInfo = document.createElement("div");
    searchInfo.style.cssText = "background: #f6f7f8; padding: 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #7c7c7c;";
    searchInfo.innerHTML = `<strong>${filtered.length}</strong> result${filtered.length !== 1 ? 's' : ''} for "<strong>${searchQuery}</strong>"`;
    feed.appendChild(searchInfo);
  }

  if (visible.length === 0) {
    const noResults = document.createElement("div");
    noResults.style.cssText = "text-align: center; padding: 60px 20px; color: #7c7c7c;";
    noResults.innerHTML = `
      <i data-lucide="search-x" style="width: 48px; height: 48px; margin: 0 auto 16px; display: block; color: #ccc;"></i>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No articles found</div>
      <div style="font-size: 14px;">${searchQuery ? 'Try a different search term' : 'No articles available'}</div>
    `;
    feed.appendChild(noResults);
    lucide.createIcons();
    return;
  }

  const fragment = document.createDocumentFragment();

  visible.forEach(post => {
    const item = document.createElement("div");
    item.className = "post-card";
    item.setAttribute("data-collection", post.collection);
    const icon = getCollectionIcon(post.collection);
    const isSaved = savedPosts.includes(post.url);
    
    const isSticker = post.collection === 'collection4';
    const isObject = post.collection === 'objects';
    const isJordan = post.collection === 'jordan';

    const fullscreenData = (isSticker || isObject || isJordan) ? JSON.stringify(post) : '';

    item.innerHTML = `
      <a href="${post.url}" target="_blank" style="display: block; color: inherit;" data-article-link='${JSON.stringify({url: post.url, title: post.title, image: post.image || ''})}' data-fullscreen-data='${fullscreenData}' data-type='${post.collection}'>
        <div class="post-header">
          <div class="post-avatar">
            <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
          </div>
          <div class="post-meta">
            <div class="post-source">${post.collectionName}</div>
            <div class="post-date">${post.date}</div>
          </div>
        </div>
        ${(!post.image || post.image.trim() === "") 
           ? "" 
           : `<img class="post-image" src="${post.image}" alt="${post.title}" loading="lazy">`}
        <div class="post-content">
          <div class="post-title">${post.title}</div>
          ${post.text ? `<div class="post-excerpt">${post.text}</div>` : ''}
          ${post.medium ? `<div class="post-excerpt"><strong>Medium:</strong> ${post.medium}</div>` : ''}
        </div>
      </a>
      <div class="post-footer">
        <span class="post-action" data-read='${JSON.stringify({url: post.url, title: post.title, image: post.image || ''})}'>
          <i data-lucide="external-link"></i> Read
        </span>
        <span class="post-action ${isSaved ? 'saved' : ''}" data-save-url="${post.url}">
          <i data-lucide="${isSaved ? 'bookmark-check' : 'bookmark'}"></i> ${isSaved ? 'Saved' : 'Save'}
        </span>
        <span class="post-action" data-share='${JSON.stringify({title: post.title, url: post.url})}'>
          <i data-lucide="share-2"></i> Share
        </span>
      </div>
    `;
    fragment.appendChild(item);
  });

  feed.appendChild(fragment);
  lucide.createIcons();

  const endOfFeed = document.getElementById('endOfFeed');
  if (visible.length >= sorted.length) {
    endOfFeed.style.display = 'block';
  } else {
    endOfFeed.style.display = 'none';
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('[data-fullscreen-data]').forEach(link => {
      const data = link.dataset.fullscreenData;
      const type = link.dataset.type;

      if (type === "jordan") {
        const item = JSON.parse(data);

        if (!item.image || item.image.trim() === "") {
          link.onclick = (e) => {
            e.preventDefault();
            const d = JSON.parse(link.dataset.articleLink);
            addToHistory(d);
            window.open(d.url || "#", "_blank");
          };
          return;
        }

        link.onclick = (e) => {
          e.preventDefault();
          document.getElementById('stickerFullscreenImage').src = item.image;

          document.getElementById('stickerFullscreenDate').textContent = "";
          document.getElementById('stickerFullscreenLocation').textContent = "";
          document.getElementById('stickerFullscreenMedium').textContent = "";
          document.getElementById('stickerFullscreenArtist').textContent = "";

          document.getElementById('stickerFullscreen').classList.add('active');
          document.body.style.overflow = 'hidden';

          addToHistory({ url: item.url, title: item.title, image: item.image });
        };
        return;
      }

      if (data && type === "collection4") {
        link.onclick = (e) => {
          e.preventDefault();
          const item = JSON.parse(data);
          openStickerFullscreen(item);
          addToHistory({ url: item.url, title: item.title, image: item.image });
        };
        return;
      }

      if (data && type === "objects") {
        link.onclick = (e) => {
          e.preventDefault();
          const item = JSON.parse(data);
          openObjectFullscreen(item);
          addToHistory({ url: item.url, title: item.text, image: item.image });
        };
        return;
      }

      if (!data) {
        link.onclick = (e) => {
          const articleData = JSON.parse(link.dataset.articleLink);
          addToHistory(articleData);
        };
        return;
      }
    });

    document.querySelectorAll('[data-read]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const data = JSON.parse(btn.dataset.read);
        addToHistory(data);
        window.open(data.url, '_blank');
      };
    });

    document.querySelectorAll('[data-save-url]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        savePost(btn.dataset.saveUrl);
      };
    });

    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sharePost(JSON.parse(btn.dataset.share));
      };
    });
  });
}

document.querySelectorAll('.nav-item[data-filter]').forEach(item => {
  item.addEventListener("click", function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    currentView = "feed";
    displayLimit = 10;
    render();
  });
});

document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener("click", function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    currentView = this.dataset.view;
    render();
  });
});

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentSort = this.dataset.sort;
    render();
  });
});

document.getElementById("searchBox").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  displayLimit = 10;
  
  if (searchQuery) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
    currentFilter = "all";
    currentView = "feed";
  }
  
  render();
});

let isLoadingMore = false;
window.addEventListener('scroll', () => {
  if (currentView !== "feed") return;
  if (isLoadingMore) return;
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollPosition >= documentHeight - 500) {
    const filtered = filterPosts(allPosts);
    const sorted = sortPosts(filtered);
    
    if (displayLimit < sorted.length) {
      isLoadingMore = true;
      displayLimit += 10;
      render();
      setTimeout(() => {
        isLoadingMore = false;
      }, 500);
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }
  
  switch(e.key.toLowerCase()) {
    case '/':
      e.preventDefault();
      document.getElementById('searchBox').focus();
      break;
      
    case 'h':
      e.preventDefault();
      goToAllPosts();
      break;
      
    case '1':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection1"]').click();
      break;
      
    case '2':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection2"]').click();
      break;
      
    case '3':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection4"]').click();
      break;
      
    case '4':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="objects"]').click();
      break;
      
    case '5':
    case 's':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="saved"]').click();
      break;
      
    case 'a':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="articles-index"]').click();
      break;
      
    case 'p':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="photographers-index"]').click();
      break;
      
    case 'i':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="stickers-index"]').click();
      break;
      
    case 'o':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="objects-index"]').click();
      break;
      
    case 'r':
      e.preventDefault();
      if (currentView === 'photographers-index') {
        randomPhotographer();
      }
      break;
      
    case 'x':
      e.preventDefault();
      document.querySelector('.sort-btn[data-sort="shuffle"]').click();
      break;
      
    case 'f':
      if (currentView.includes('-index')) {
        e.preventDefault();
        toggleFullscreen();
      }
      break;
      
    case '?':
      e.preventDefault();
      showKeyboardShortcuts();
      break;
      
    case 'escape':
      if (document.getElementById('stickerFullscreen').classList.contains('active')) {
        closeStickerFullscreen(e);
      }
      if (document.getElementById('keyboardShortcutsModal')) {
        closeKeyboardShortcuts();
      }
      break;
  }
});

function showKeyboardShortcuts() {
  const existing = document.getElementById('keyboardShortcutsModal');
  if (existing) {
    existing.remove();
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'keyboardShortcutsModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 32px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Keyboard Shortcuts</h2>
        <button onclick="closeKeyboardShortcuts()" style="background: transparent; border: none; font-size: 24px; cursor: pointer; color: #7c7c7c; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      
      <div style="display: grid; gap: 20px;">
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Navigation</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to All Posts</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">H</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Articles</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">1</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Field Notes</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">2</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Stickers</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">3</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Objects</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">4</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Saved</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">5</kbd> or <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">S</kbd>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Indexes</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Articles Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">A</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Photographers Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">P</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Stickers Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">I</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Objects Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">O</kbd>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Actions</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Search</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">/</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Shuffle Posts</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">X</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Random Photographer</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">R</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Toggle Fullscreen (Index pages)</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">F</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Close Modal</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">Esc</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span>Show This Help</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">?</kbd>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #edeff1; text-align: center; color: #7c7c7c; font-size: 14px;">
        Press <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">?</kbd> anytime to toggle this help
      </div>
    </div>
  `;
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeKeyboardShortcuts();
    }
  };
  
  document.body.appendChild(modal);
}

function closeKeyboardShortcuts() {
  const modal = document.getElementById('keyboardShortcutsModal');
  if (modal) {
    modal.remove();
  }
}

function toggleFullscreen() {
  document.body.classList.toggle('fullscreen-mode');
  const icon = document.getElementById('fullscreenIcon');
  const isFullscreen = document.body.classList.contains('fullscreen-mode');
  
  if (isFullscreen) {
    icon.setAttribute('data-lucide', 'minimize-2');
  } else {
    icon.setAttribute('data-lucide', 'maximize-2');
  }
  
  lucide.createIcons();
}

function showFullscreenToggle() {
  document.getElementById('fullscreenToggle').classList.add('visible');
}

function hideFullscreenToggle() {
  document.getElementById('fullscreenToggle').classList.remove('visible');
  document.body.classList.remove('fullscreen-mode');
  const icon = document.getElementById('fullscreenIcon');
  icon.setAttribute('data-lucide', 'maximize-2');
  lucide.createIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllData);
} else {
  loadAllData();
}
