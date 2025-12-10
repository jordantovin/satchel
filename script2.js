async function loadAllData() {
  try {
    const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
      fetch(sheetURL1),
      fetch(sheetURL2),
      fetch(sheetURL3),
      fetch(sheetURL4),
      fetch(sheetURL5),
      fetch(sheetURL6),
      fetch(sheetURL7)
    ]);
    
    const [text1, text2, text3, text4, text5, text6, text7] = await Promise.all([
      res1.text(),
      res2.text(),
      res3.text(),
      res4.text(),
      res5.text(),
      res6.text(),
      res7.text()
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
    stickersIndex = parsed4
      .filter(r =>
        r.src &&
        r.date &&
        r.location_overlay &&
        r.medium
      )
      .map(p => ({
        ...p,
        image: p.src,
        date: normalizeDate(p.date),
        location: p.location_overlay,
        location_card: p.location_card,
        medium: p.medium,
        artist: p.artist || 'Unknown'
      }));

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

    const parsed6 = Papa.parse(text6, { header: true }).data;

    jordanPosts = parsed6
      .filter(r => r.Date && r.Title)
      .map(p => {
        const hasImage = p.Image && p.Image.trim() !== "";
        const hasLink = p.Link && p.Link.trim() !== "";

        return {
          collection: "jordan",
          collectionName: "Jordan",
          title: p.Title,
          date: normalizeDate(p.Date),
          text: p.Text || "",
          image: hasImage ? p.Image : "",
          url: hasLink ? p.Link : (hasImage ? p.Image : "#")
        };
      });

    const posts4 = parsed4
      .filter(r => 
        r.src &&
        r.date &&
        r.location_card &&
        r.medium &&
        r.feed &&
        r.feed.trim().toLowerCase() === "yes"
      )
      .map(p => ({
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

    const parsed7 = Papa.parse(text7, { header: true }).data;
    
    photosIndex = parsed7
      .filter(r => r.Image && r.Date)
      .map(p => ({
        image: p.Image,
        date: normalizeDate(p.Date),
        title: p.Title || 'Photo',
        location: p.Location || '',
        notes: p.Notes || ''
      }));

    const posts7 = parsed7
      .filter(r => r.Image && r.Date && r.Feed && r.Feed.trim().toLowerCase() === "yes")
      .map(p => ({
        collection: "photos",
        collectionName: "Photos",
        title: p.Title || 'Photo',
        date: normalizeDate(p.Date),
        url: p.Image,
        image: p.Image,
        location: p.Location || '',
        notes: p.Notes || ''
      }));

    allPosts = [ ...posts1, ...posts2, ...posts4, ...posts5, ...jordanPosts, ...posts7 ];
    
    document.getElementById('countAll').textContent = allPosts.length;
    document.getElementById('count1').textContent = posts1.length;
    document.getElementById('count2').textContent = posts2.length;
    document.getElementById('count3').textContent = photographers.length;
    document.getElementById('count4').textContent = posts4.length;
    document.getElementById('countStickersIndex').textContent = stickersIndex.length;
    document.getElementById('countArticlesIndex').textContent = articlesIndex.length;
    document.getElementById("countObjects").textContent = posts5.length;
    document.getElementById("countObjectsIndex").textContent = objectsIndex.length;
    document.getElementById("countPhotos").textContent = posts7.length;
    document.getElementById("countPhotosIndex").textContent = photosIndex.length;

    updateHistory();
    document.getElementById('countSaved').textContent = savedPosts.length;

    lucide.createIcons();
    render();
  } catch (error) {
    console.error("Error loading data:", error);
  }
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

function renderPhotosIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Photos</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
        <button class="sort-btn active" data-sort="latest">Latest</button>
        <button class="sort-btn" data-sort="oldest">Oldest</button>
      </div>
    </div>
    <div class="index-search">
      <input type="text" id="photoSearch" placeholder="Search photos by title, location, or notes..." />
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedPhotos = [...photosIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentPhotoSort = 'latest';
  
  const gridContainer = document.createElement("div");
  gridContainer.id = "photoGrid";
  indexContainer.appendChild(gridContainer);
  
  feed.appendChild(indexContainer);
  
  renderPhotoGrid(sortedPhotos, gridContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentPhotoSort = this.dataset.sort;
      
      if (currentPhotoSort === 'az') {
        sortedPhotos = [...photosIndex].sort((a, b) => a.title.localeCompare(b.title));
      } else if (currentPhotoSort === 'za') {
        sortedPhotos = [...photosIndex].sort((a, b) => b.title.localeCompare(a.title));
      } else if (currentPhotoSort === 'latest') {
        sortedPhotos = [...photosIndex].sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (currentPhotoSort === 'oldest') {
        sortedPhotos = [...photosIndex].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      const query = document.getElementById('photoSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedPhotos.filter(p => {
          return Object.values(p).some(value => {
            return value && typeof value === 'string' && value.toLowerCase().includes(query);
          });
        });
        renderPhotoGrid(filtered, gridContainer);
      } else {
        renderPhotoGrid(sortedPhotos, gridContainer);
      }
    });
  });
  
  document.getElementById('photoSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderPhotoGrid(sortedPhotos, gridContainer);
    } else {
      const filtered = sortedPhotos.filter(p => {
        return Object.values(p).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      });
      renderPhotoGrid(filtered, gridContainer);
    }
  });
  
  lucide.createIcons();
}
