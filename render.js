// Rendering functions

function switchIndex() {
  currentIndex = document.getElementById('indexSelector').value;
  
  if (currentIndex === 'photographers') {
    // Show photographers view, hide gallery
    document.getElementById('photographersContent').classList.add('active');
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('rightSidebar').classList.remove('open');
    renderPhotographers();
    updateImageCount(photographersData.length);
  } else {
    // Show gallery view, hide photographers
    document.getElementById('photographersContent').classList.remove('active');
    document.getElementById('gallery').style.display = 'grid';
    updateFilterVisibility();
    applyFilters();
  }
}

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
  
  // Filter photographers by search term
  filteredPhotographers = photographersData.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm)
  );
  
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
