// Main initialization and data loading

function switchIndex() {
  currentIndex = document.getElementById('indexSelector').value;
  universalSearchMode = false;
  document.getElementById('topSearchInput').value = '';
  
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

function switchMode() {
  currentMode = document.getElementById('modeSelector').value;
  universalSearchMode = false;
  
  if (currentMode === 'blog') {
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('photographersContent').classList.remove('active');
    document.getElementById('blogContent').classList.add('active');
    document.getElementById('indexSelector').style.display = 'none';
    document.getElementById('rightSidebar').classList.remove('open');
    document.getElementById('imageCount').textContent = 'Blog Mode';
    document.getElementById('topSearchInput').placeholder = 'Search blog...';
    
    if (blogPostsData.length === 0) {
      loadBlogPosts();
    }
  } else {
    document.getElementById('blogContent').classList.remove('active');
    document.getElementById('gallery').style.display = 'grid';
    document.getElementById('indexSelector').style.display = 'block';
    document.getElementById('topSearchInput').placeholder = 'Search everything...';
    switchIndex();
  }
}

// Universal search function
async function performUniversalSearch(keyword) {
  if (!keyword || keyword.length < 2) {
    universalSearchMode = false;
    if (currentMode === 'archive') {
      switchIndex();
    }
    return;
  }
  
  universalSearchMode = true;
  universalSearchResults = [];
  const searchLower = keyword.toLowerCase();
  
  // Search all archive data
  Object.keys(allData).forEach(dataType => {
    allData[dataType].forEach(item => {
      const searchText = Object.values(item).join(' ').toLowerCase();
      if (searchText.includes(searchLower)) {
        universalSearchResults.push({...item, searchSource: dataType});
      }
    });
  });
  
  // Search photographers (all columns)
  photographersData.forEach(photographer => {
    const searchText = Object.values(photographer).join(' ').toLowerCase();
    if (searchText.includes(searchLower)) {
      universalSearchResults.push({
        ...photographer,
        searchSource: 'photographers',
        type: 'photographer',
        src: '',
        displayName: `${photographer.firstName} ${photographer.lastName}`
      });
    }
  });
  
  // Search blog posts
  blogPostsData.forEach(post => {
    const searchText = Object.values(post).join(' ').toLowerCase();
    if (searchText.includes(searchLower)) {
      universalSearchResults.push({
        ...post,
        searchSource: 'blog',
        type: 'blog',
        src: post.link || '',
        photo: post.pictures || '',
        displayTitle: post.title
      });
    }
  });
  
  // Search inspo posts
  inspoPostsData.forEach(post => {
    const searchText = Object.values(post).join(' ').toLowerCase();
    if (searchText.includes(searchLower)) {
      universalSearchResults.push({
        ...post,
        searchSource: 'inspo',
        type: 'inspo',
        src: post.link || '',
        displayTitle: post.name
      });
    }
  });
  
  // Search field notes
  fieldNotesData.forEach(note => {
    const searchText = Object.values(note).join(' ').toLowerCase();
    if (searchText.includes(searchLower)) {
      universalSearchResults.push({
        ...note,
        searchSource: 'fieldNotes',
        type: 'fieldNote',
        src: note.url || '',
        photo: note.image || '',
        displayTitle: note.title
      });
    }
  });
  
  // Show results
  document.getElementById('photographersContent').classList.remove('active');
  document.getElementById('blogContent').classList.remove('active');
  document.getElementById('gallery').style.display = 'grid';
  
  renderUniversalSearchResults();
  updateImageCount(universalSearchResults.length);
}

async function loadAllData() {
  try {
    const [americanismsData, objectsData, articlesData, picturesData, photographersListData] = await Promise.all([
      fetchCSV(americanismsURL),
      fetchCSV(objectsURL),
      fetchCSV(articlesURL),
      fetchCSV(picturesURL),
      fetchCSV(photographersListURL)
    ]);

    // Process Americanisms and Objects (combined into Objects)
    const americanismsProcessed = americanismsData.map(row => ({
      src: row.src || row.Src || "",
      date: row.date || row.Date || "",
      sortDate: parseDate(row.date || row.Date || ""),
      location_card: (row.location_card || row.Location_card || "").replace(/\\n/g, '\n'),
      location_overlay: (row.location_overlay || row.Location_overlay || "").replace(/\\n/g, '\n'),
      medium: row.medium || row.Medium || "",
      artist: row.artist || row.Artist || "",
      keywords: row.keywords || row.Keywords || "",
      title: "",
      note: "",
      source: "Americanisms",
      type: "objects"
    })).filter(img => img.src);

    const objectsProcessed = objectsData.map(row => ({
      src: row.Image || row.image || "",
      date: row.Date || row.date || "",
      sortDate: parseDate(row.Date || row.date || ""),
      location_card: "",
      location_overlay: "",
      medium: "",
      artist: "",
      keywords: "",
      title: row.Title || row.title || "",
      note: row.Note || row.note || "",
      source: "Objects",
      type: "objects"
    })).filter(img => img.src);

    allData.objects = [...americanismsProcessed, ...objectsProcessed];

    // Process Articles (as links, not images)
    allData.articles = articlesData.map(row => ({
      src: row.src || row.Src || "",
      photo: row.photo || row.Photo || "",
      date: row.date || row.Date || "",
      sortDate: parseDate(row.date || row.Date || ""),
      source: row.test || row.Test || "",
      type: "articles"
    })).filter(img => img.src);

    // Process Pictures
    allData.pictures = picturesData.map(row => ({
      src: row.Link || row.link || "",
      date: row.Date || row.date || "",
      sortDate: parseDate(row.Date || row.date || ""),
      photographer: row.Photographer || row.photographer || "",
      note: row.Note || row.note || "",
      type: "pictures"
    })).filter(img => img.src);
    
    // Process Photographers List
    const allPeople = photographersListData
      .filter(row => {
        const hasFirst = row['First Name'] && row['First Name'].trim();
        const hasLast = row['Last Name'] && row['Last Name'].trim();
        return hasFirst && hasLast;
      })
      .map(row => ({
        firstName: (row['First Name'] || '').trim(),
        lastName: (row['Last Name'] || '').trim(),
        website: (row['Website'] || '').trim(),
        className: (row['Class'] || '').trim(),
        dateAdded: (row['Date Added'] || '').trim()
      }));
    
    const allPhotographers = allPeople.filter(person => {
      const classLower = person.className.toLowerCase();
      return classLower.includes('photographer');
    });
    
    photographersData = allPhotographers.filter(person => person.website !== '');
    photographersData.sort((a, b) => a.lastName.localeCompare(b.lastName));

    // Sort all by date (newest first)
    Object.keys(allData).forEach(key => {
      allData[key].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    });

    // Load blog data
    await loadBlogData();

    switchIndex();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function loadBlogData() {
  try {
    const [blogRes, inspoRes, fieldRes] = await Promise.all([
      fetch(blogPostsURL),
      fetch(inspoPostsURL),
      fetch(fieldNotesURL)
    ]);
    
    const [blogText, inspoText, fieldText] = await Promise.all([
      blogRes.text(),
      inspoRes.text(),
      fieldRes.text()
    ]);
    
    const blogParsed = Papa.parse(blogText, { header: true, skipEmptyLines: true });
    const insParsed = Papa.parse(inspoText, { header: true, skipEmptyLines: true });
    const fieldParsed = Papa.parse(fieldText, { header: true, skipEmptyLines: true });
    
    blogPostsData = blogParsed.data.map(row => ({
      title: row.Title || row.title || '',
      date: row.Date || row.date || '',
      pictures: row.Pictures || row.pictures || '',
      text: row.Text || row.text || '',
      link: row.Link || row.link || ''
    })).filter(post => post.title);
    
    inspoPostsData = insParsed.data.map(row => ({
      name: row.Name || row.name || '',
      date: row.Date || row.date || '',
      pictures: row.Pictures || row.pictures || '',
      text: row.Text || row.text || '',
      link: row.Link || row.link || ''
    })).filter(post => post.name && post.link);
    
    fieldNotesData = fieldParsed.data.map(row => ({
      date: row.date || row.Date || row.A || '',
      title: row.title || row.Title || row.B || '',
      url: row.url || row.URL || row.D || '',
      image: row.image || row.Image || row.G || '',
      number: row.number || row.Number || row.M || ''
    })).filter(post => post.title);
    
  } catch (error) {
    console.error('Error loading blog data:', error);
  }
}

// Keyboard shortcuts
function showShortcutsModal() {
  document.getElementById('shortcutsModal').style.display = 'block';
  document.getElementById('shortcutsOverlay').style.display = 'block';
}

function closeShortcutsModal() {
  document.getElementById('shortcutsModal').style.display = 'none';
  document.getElementById('shortcutsOverlay').style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Overlay click handler
  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("overlay")) {
      hideOverlay();
    }
  });

  // Fullscreen button
  document.getElementById("fullscreenBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  // Close button
  document.getElementById("closeBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    hideOverlay();
  });

  // Keyboard navigation in overlay
  document.addEventListener('keydown', (e) => {
    if (document.getElementById("overlay").style.display === "flex") {
      if (e.key === "ArrowLeft" && currentImageIndex > 0) {
        showOverlay(currentImageIndex - 1);
      } else if (e.key === "ArrowRight" && currentImageIndex < filteredImages.length - 1) {
        showOverlay(currentImageIndex + 1);
      } else if (e.key === "Escape") {
        hideOverlay();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in search fields
    if (e.target.tagName === 'INPUT' && e.key !== 'Escape' && e.key !== '/') return;
    
    // Show help modal
    if (e.key === '?') {
      e.preventDefault();
      showShortcutsModal();
      return;
    }
    
    // Close modals
    if (e.key === 'Escape') {
      closeShortcutsModal();
      return;
    }
    
    // Focus search
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('topSearchInput').focus();
      return;
    }
    
    // Mode switches
    if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      document.getElementById('modeSelector').value = 'blog';
      switchMode();
      return;
    }
    
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      document.getElementById('modeSelector').value = 'archive';
      switchMode();
      return;
    }
    
    // Index switches (only in archive mode)
    if (currentMode === 'archive') {
      if (e.key === '1') {
        e.preventDefault();
        document.getElementById('indexSelector').value = 'objects';
        switchIndex();
      } else if (e.key === '2') {
        e.preventDefault();
        document.getElementById('indexSelector').value = 'articles';
        switchIndex();
      } else if (e.key === '3') {
        e.preventDefault();
        document.getElementById('indexSelector').value = 'pictures';
        switchIndex();
      } else if (e.key === '4') {
        e.preventDefault();
        document.getElementById('indexSelector').value = 'photographers';
        switchIndex();
      }
    }
  });

  // Search input with universal search
  document.getElementById('topSearchInput').addEventListener('input', function(e) {
    const keyword = e.target.value;
    
    if (currentMode === 'blog') {
      // In blog mode, filter blog content
      const searchLower = keyword.toLowerCase();
      
      // Filter and render blog posts
      const filteredPosts = blogPostsData.filter(post => 
        Object.values(post).join(' ').toLowerCase().includes(searchLower)
      );
      
      const postsContainer = document.getElementById('postsSection');
      if (document.getElementById('postsBtn').classList.contains('active')) {
        postsContainer.innerHTML = '';
        filteredPosts.forEach(post => {
          const postDiv = document.createElement('div');
          postDiv.className = 'blog-post';
          
          let postHTML = `<h2>${post.title}</h2>`;
          postHTML += `<div class="date">${post.date}</div>`;
          
          if (post.pictures) {
            postHTML += `<div style="margin: 20px 0;"><img src="${post.pictures}" alt="${post.title}" style="max-width: 600px; width: 100%; height: auto; border-radius: 4px;"></div>`;
          }
          
          if (post.text) {
            postHTML += `<p>${post.text}</p>`;
          }
          
          if (post.link) {
            postHTML += `<p><a href="${post.link}" target="_blank" style="color: #0066cc; text-decoration: underline;">Read more →</a></p>`;
          }
          
          postDiv.innerHTML = postHTML;
          postsContainer.appendChild(postDiv);
        });
      }
    } else if (currentIndex === 'photographers') {
      // In photographers view, use photographer search
      document.getElementById('photographersSearch').value = keyword;
      renderPhotographers();
    } else {
      // In archive mode, use universal search
      if (keyword.length >= 2) {
        performUniversalSearch(keyword);
      } else {
        applyFilters();
      }
    }
  });

  // Photographers search
  document.getElementById('photographersSearch').addEventListener('input', renderPhotographers);

  // All photographers button
  document.getElementById('allPhotographers').addEventListener('click', function() {
    document.getElementById('photographersSearch').value = '';
    this.classList.add('active');
    document.getElementById('randomPhotographer').classList.remove('active');
    renderPhotographers();
  });

  // Random photographer button
  document.getElementById('randomPhotographer').addEventListener('click', function() {
    if (photographersData.length > 0) {
      const randomPhotographer = photographersData[Math.floor(Math.random() * photographersData.length)];
      window.open(randomPhotographer.website, '_blank');
    }
    this.classList.add('active');
    document.getElementById('allPhotographers').classList.remove('active');
  });

  // Load data
  loadAllData();
});
