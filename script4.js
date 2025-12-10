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

function renderPhotoGrid(photosList, container) {
  container.innerHTML = '';
  
  if (photosList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No photos found</div>';
    return;
  }
  
  const grid = document.createElement("div");
  grid.className = "stickers-grid";
  
  photosList.forEach(photo => {
    const item = document.createElement("div");
    item.className = "sticker-grid-item";
    item.onclick = () => {
      openPhotoFullscreen({
        collection: 'photos',
        image: photo.image,
        date: photo.date,
        location: photo.location,
        notes: photo.notes,
        title: photo.title
      });
    };
    
    const overlayContent = [];
    overlayContent.push(`<div><strong>Date:</strong> ${photo.date}</div>`);
    if (photo.title) overlayContent.push(`<div><strong>Title:</strong> ${photo.title}</div>`);
    if (photo.location) overlayContent.push(`<div><strong>Location:</strong> ${photo.location}</div>`);
    if (photo.notes) overlayContent.push(`<div><strong>Notes:</strong> ${photo.notes}</div>`);
    
    item.innerHTML = `
      <img class="sticker-grid-image" src="${photo.image}" alt="${photo.title}">
      <div class="sticker-grid-overlay">
        ${overlayContent.join('')}
      </div>
    `;
    
    grid.appendChild(item);
  });
  
  container.appendChild(grid);
}

function renderPicturesIndex() {
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  showFullscreenToggle();
  
  const indexContainer = document.createElement("div");
  indexContainer.className = "photographers-index";
  
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0;">Pictures</h2>
      <div style="display: flex; gap: 8px; margin-right: 40px;">
        <button class="sort-btn active" data-sort="az">A-Z</button>
        <button class="sort-btn" data-sort="za">Z-A</button>
      </div>
    </div>
    <div class="index-search">
      <input type="text" id="pictureSearch" placeholder="Search pictures by photographer..." />
    </div>
  `;
  indexContainer.appendChild(header);
  
  let sortedPictures = [...picturesIndex].sort((a, b) => a.photographer.localeCompare(b.photographer));
  let currentPictureSort = 'az';
  
  const listContainer = document.createElement("div");
  listContainer.id = "pictureList";
  indexContainer.appendChild(listContainer);
  
  feed.appendChild(indexContainer);
  
  renderPictureList(sortedPictures, listContainer);
  
  document.querySelectorAll('.photographers-index .sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.photographers-index .sort-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentPictureSort = this.dataset.sort;
      
      if (currentPictureSort === 'az') {
        sortedPictures = [...picturesIndex].sort((a, b) => a.photographer.localeCompare(b.photographer));
      } else if (currentPictureSort === 'za') {
        sortedPictures = [...picturesIndex].sort((a, b) => b.photographer.localeCompare(a.photographer));
      }
      
      const query = document.getElementById('pictureSearch').value.toLowerCase().trim();
      if (query) {
        const filtered = sortedPictures.filter(p => p.photographer.toLowerCase().includes(query));
        renderPictureList(filtered, listContainer);
      } else {
        renderPictureList(sortedPictures, listContainer);
      }
    });
  });
  
  document.getElementById('pictureSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      renderPictureList(sortedPictures, listContainer);
    } else {
      const filtered = sortedPictures.filter(p => 
        p.photographer.toLowerCase().includes(query)
      );
      renderPictureList(filtered, listContainer);
    }
  });
  
  lucide.createIcons();
}

function renderPictureList(picturesList, container) {
  container.innerHTML = '';
  
  if (picturesList.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7c7c7c;">No pictures found</div>';
    return;
  }
  
  const grouped = {};
  picturesList.forEach(p => {
    const letter = p.photographer.charAt(0).toUpperCase();
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
    
    grouped[letter].forEach(picture => {
      const link = document.createElement("a");
      link.className = "photographer-link";
      link.href = picture.link;
      link.target = "_blank";
      link.textContent = picture.photographer.toLowerCase();
      link.onclick = (e) => {
        addToHistory({
          url: picture.link,
          title: picture.photographer,
          image: ''
        });
      };
      grid.appendChild(link);
    });
    
    section.appendChild(grid);
    container.appendChild(section);
  });
}
