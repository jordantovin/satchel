// Main initialization and data loading

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
    console.log('Raw CSV data sample:', photographersListData.slice(0, 3));
    console.log('CSV headers:', photographersListData[0] ? Object.keys(photographersListData[0]) : 'No data');
    console.log('Total raw rows:', photographersListData.length);
    
    // Get all rows with first and last names (trim whitespace)
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
    
    console.log('Total people with names:', allPeople.length);
    
    // Filter for photographers (case-insensitive, trimmed)
    const allPhotographers = allPeople.filter(person => {
      const classLower = person.className.toLowerCase();
      return classLower.includes('photographer');
    });
    
    console.log('Total photographers (with or without website):', allPhotographers.length);
    
    // Only keep photographers with actual websites
    photographersData = allPhotographers.filter(person => person.website !== '');

    console.log('Photographers with websites:', photographersData.length);
    
    // Show some examples of what we're filtering out
    const photographersWithoutWebsite = allPhotographers.filter(person => person.website === '');
    console.log('Photographers WITHOUT websites:', photographersWithoutWebsite.length);
    console.log('Sample photographers without websites:', photographersWithoutWebsite.slice(0, 5));

    // Sort photographers by last name
    photographersData.sort((a, b) => a.lastName.localeCompare(b.lastName));

    // Sort all by date (newest first)
    Object.keys(allData).forEach(key => {
      allData[key].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    });

    switchIndex();
  } catch (error) {
    console.error('Error loading data:', error);
  }
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

  // Keyboard navigation
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

  // Search input
  document.getElementById('topSearchInput').addEventListener('input', applyFilters);

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
