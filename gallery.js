// Gallery rendering and overlay functions

function renderImages(imageArray) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  
  // Update gallery class based on current index
  gallery.className = '';
  if (currentIndex === 'objects') {
    gallery.classList.add('objects-view');
  } else if (currentIndex === 'articles') {
    gallery.classList.add('articles-view');
  }
  
  imageArray.forEach((img, index) => {
    // Render articles as links
    if (img.type === 'articles') {
      const card = document.createElement("div");
      card.className = "article-card";
      
      const link = document.createElement("a");
      link.href = img.src;
      link.target = "_blank";
      
      const thumbnail = document.createElement("img");
      thumbnail.src = img.photo;
      thumbnail.alt = img.source;
      
      const info = document.createElement("div");
      info.className = "article-info";
      info.innerHTML = `
        <div class="article-date">${img.date}</div>
        <div class="article-source">${img.source}</div>
      `;
      
      link.appendChild(thumbnail);
      link.appendChild(info);
      card.appendChild(link);
      gallery.appendChild(card);
    } else {
      // Render as image card
      const card = document.createElement("div");
      card.className = "image-card";

      const imageEl = document.createElement("img");
      imageEl.src = img.src;
      imageEl.alt = img.title || "Image";

      imageEl.addEventListener('load', () => {
        imageEl.classList.add('loaded');
      });

      const metadata = document.createElement("div");
      metadata.className = "metadata";
      
      // Different metadata for different types
      let metadataHTML = `<strong>Date:</strong> ${img.date}<br>`;
      
      if (img.source === "Americanisms") {
        metadataHTML += `<strong>Location:</strong><br>${img.location_card.replace(/\n/g, "<br>")}<br>`;
        metadataHTML += `<strong>Medium:</strong> ${img.medium}`;
      } else if (img.source === "Objects") {
        metadataHTML += `<strong>Title:</strong> ${img.title}<br>`;
        if (img.note) metadataHTML += `<strong>Note:</strong> ${img.note}`;
      } else if (img.type === "pictures") {
        metadataHTML += `<strong>Photographer:</strong> ${img.photographer}<br>`;
        if (img.note) metadataHTML += `<strong>Note:</strong> ${img.note}`;
      }
      
      metadata.innerHTML = metadataHTML;

      card.appendChild(imageEl);
      card.appendChild(metadata);
      gallery.appendChild(card);

      card.addEventListener("click", () => showOverlay(index));
    }
  });
}

function renderPhotographers() {
  const searchTerm = document.getElementById('photographersSearch').value.toLowerCase();
  
  // Filter photographers by ALL columns
  filteredPhotographers = photographersData.filter(p => {
    const searchText = Object.values(p).join(' ').toLowerCase();
    return searchText.includes(searchTerm);
  });
  
  const list = document.getElementById('photographersList');
  list.innerHTML = '';
  
  if (filteredPhotographers.length === 0) {
    list.innerHTML = '<p style="font-size: 18px; color: #666;">No photographers found</p>';
    document.getElementById('highlightCount').textContent = '0';
    return;
  }
  
  // Group by first letter of last name
  const groupedByLetter = {};
  filteredPhotographers.forEach(p => {
    const firstLetter = p.lastName[0].toUpperCase();
    if (!groupedByLetter[firstLetter]) {
      groupedByLetter[firstLetter] = [];
    }
    groupedByLetter[firstLetter].push(p);
  });
  
  // Sort letters
  const letters = Object.keys(groupedByLetter).sort();
  
  const today = new Date();
  
  // Render each letter group
  letters.forEach(letter => {
    const divider = document.createElement('div');
    divider.className = 'section-divider';
    list.appendChild(divider);
    
    const header = document.createElement('div');
    header.className = 'letter-header';
    header.textContent = letter;
    list.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'two-column';
    
    groupedByLetter[letter].forEach(photographer => {
      const nameItem = document.createElement('div');
      nameItem.className = 'name-item';
      
      const link = document.createElement('a');
      link.href = photographer.website;
      link.target = '_blank';
      link.textContent = `${photographer.firstName} ${photographer.lastName}`;
      
      // Highlight recent additions (within 7 days)
      if (photographer.dateAdded) {
        const addedDate = parsePhotographerDate(photographer.dateAdded);
        if (addedDate) {
          const diff = (today - addedDate) / (1000 * 60 * 60 * 24);
          if (diff <= 7 && diff >= 0) {
            link.style.backgroundColor = "#ffff66";
            link.style.fontWeight = "bold";
          }
        }
      }
      
      nameItem.appendChild(link);
      grid.appendChild(nameItem);
    });
    
    list.appendChild(grid);
  });
  
  document.getElementById('highlightCount').textContent = filteredPhotographers.length;
  updateImageCount(filteredPhotographers.length);
}

function renderUniversalSearchResults() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  gallery.className = 'universal-search-view';
  
  if (universalSearchResults.length === 0) {
    gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 18px; color: #666;">No results found</div>';
    return;
  }
  
  universalSearchResults.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "universal-search-card";
    
    // Different rendering based on type
    if (item.type === 'photographer') {
      card.innerHTML = `
        <div class="search-card-content photographer-card">
          <div class="search-card-type">Photographer</div>
          <div class="search-card-title">${item.displayName}</div>
          ${item.website ? `<a href="${item.website}" target="_blank" class="search-card-link">Visit Website →</a>` : ''}
        </div>
      `;
    } else if (item.type === 'blog' || item.type === 'inspo' || item.type === 'fieldNote') {
      const typeName = item.type === 'blog' ? 'Blog Post' : item.type === 'inspo' ? 'Inspiration' : 'Field Note';
      card.innerHTML = `
        <div class="search-card-content blog-card">
          ${item.photo ? `<img src="${item.photo}" alt="${item.displayTitle}" style="width: 100%; height: 120px; object-fit: cover; margin-bottom: 10px;">` : ''}
          <div class="search-card-type">${typeName}</div>
          <div class="search-card-title">${item.displayTitle}</div>
          ${item.date ? `<div class="search-card-date">${item.date}</div>` : ''}
          ${item.src ? `<a href="${item.src}" target="_blank" class="search-card-link">Read More →</a>` : ''}
        </div>
      `;
    } else {
      // Regular archive items (objects, articles, pictures)
      const typeName = item.searchSource.charAt(0).toUpperCase() + item.searchSource.slice(1);
      
      if (item.type === 'articles') {
        card.className = "article-card";
        card.innerHTML = `
          <a href="${item.src}" target="_blank">
            <img src="${item.photo}" alt="${item.source}">
            <div class="article-info">
              <div class="article-date">${item.date}</div>
              <div class="article-source">${item.source}</div>
              <div class="search-card-type" style="margin-top: 5px; font-size: 11px; color: #999;">Article</div>
            </div>
          </a>
        `;
      } else {
        card.className = "image-card";
        
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.title || "Image";
        img.addEventListener('load', () => img.classList.add('loaded'));
        
        const metadata = document.createElement("div");
        metadata.className = "metadata";
        
        let metadataHTML = `<div class="search-card-type">${typeName}</div>`;
        metadataHTML += `<strong>Date:</strong> ${item.date}<br>`;
        
        if (item.source === "Americanisms") {
          metadataHTML += `<strong>Location:</strong><br>${item.location_card.replace(/\n/g, "<br>")}<br>`;
          metadataHTML += `<strong>Medium:</strong> ${item.medium}`;
        } else if (item.source === "Objects") {
          metadataHTML += `<strong>Title:</strong> ${item.title}<br>`;
          if (item.note) metadataHTML += `<strong>Note:</strong> ${item.note}`;
        } else if (item.type === "pictures") {
          metadataHTML += `<strong>Photographer:</strong> ${item.photographer}<br>`;
          if (item.note) metadataHTML += `<strong>Note:</strong> ${item.note}`;
        }
        
        metadata.innerHTML = metadataHTML;
        card.appendChild(img);
        card.appendChild(metadata);
        
        // Make clickable for overlay
        card.addEventListener("click", () => {
          filteredImages = universalSearchResults.filter(r => r.type !== 'photographer' && r.type !== 'blog' && r.type !== 'inspo' && r.type !== 'fieldNote' && r.type !== 'articles');
          const imgIndex = filteredImages.findIndex(f => f === item);
          if (imgIndex !== -1) {
            showOverlay(imgIndex);
          }
        });
      }
    }
    
    gallery.appendChild(card);
  });
}

function showOverlay(index) {
  currentImageIndex = index;
  const img = filteredImages[index];
  
  // Skip overlay for articles
  if (img.type === 'articles') return;
  
  document.getElementById("overlayImg").src = img.src;
  document.getElementById("overlay").style.display = "flex";
  
  let overlayHTML = `<strong>Date:</strong> ${img.date}<br>`;
  
  if (img.source === "Americanisms") {
    overlayHTML += `<strong>Location:</strong><br>${img.location_overlay.replace(/\n/g, "<br>")}<br>`;
    overlayHTML += `<strong>Medium:</strong> ${img.medium}<br>`;
    if (img.artist) overlayHTML += `<strong>Artist:</strong> ${img.artist}`;
  } else if (img.source === "Objects") {
    overlayHTML += `<strong>Title:</strong> ${img.title}<br>`;
    if (img.note) overlayHTML += `<strong>Note:</strong> ${img.note}`;
  } else if (img.type === "pictures") {
    overlayHTML += `<strong>Photographer:</strong> ${img.photographer}<br>`;
    if (img.note) overlayHTML += `<strong>Note:</strong> ${img.note}`;
  }
  
  document.getElementById("overlayMetadata").innerHTML = overlayHTML;
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("overlayImg").src = "";
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

async function toggleFullscreen() {
  const overlay = document.getElementById("overlay");
  
  try {
    if (!document.fullscreenElement) {
      await overlay.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.log('Fullscreen error:', err);
    alert('Fullscreen failed. Try pressing F11 or use the F key.');
  }
}
