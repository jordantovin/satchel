// ============================================================================
// AMERICANISMS GALLERY - MAIN SCRIPT
// Consolidated functionality for gallery, blog, photographers, places, and search
// ============================================================================

(function() {
  'use strict';

  // ============================================================================
  // GLOBAL STATE
  // ============================================================================
  
  let currentMode = 'archive';
  let currentSortMode = 'NEWEST'; // 'NEWEST', 'OLDEST', 'alphabetical'
  let blogPostsData = [];
  let inspoPostsData = [];
  let fieldNotesData = [];
  let placesData = [];
  
  const blogPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThaJ-Q5u7zUSy9DA5oMCUkajzPdkWpECZzQf7SYpi8SvSCqvRgzlQvAUI6xAtaumQEnsaHSbYLkHt_/pub?output=csv';
  const inspoPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtF8T2xKCyuDXq1_hyxL0Do2g8wfQ5AtrA-SlKSoUa5TlyuaKgekwK4j4ezU1z8dVjf5P8YYVnoXT9/pub?output=csv';
  const fieldNotesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv';
  const placesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSw2ES5awbVdygDc4yHNxEI5g7-bouiex1QmT4yIA94iNHtzGDRLtTNIP3GOl15myZX9yye8XDyaEXY/pub?output=csv';
  
  const americanismsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-tRe4QAkAIideMvvWDNWq2Aj_Nx6m4QG9snhFkpqqOGX8gU09X6uUQdkfuOj9yLIybn0iPIFoZbK-/pub?output=csv';
  const objectsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv';
  const articlesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTo8ua4UreD9MUP4CI6OOXkt8LeagGX9w85veJfgi9DKJnHc2-dbCMvq5cx8DtlUO0YcV5RMPzcJ_KG/pub?output=csv';
  const picturesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5j1OVFnwB19xVA3ZVM46C8tNKvGHimyElwIAgMFDzurSEFA0m_8iHBIvD1_TKbtlfWw2MaDAirm47/pub?output=csv';
  const photographersListURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UTNOg8d2LIrCU8A9ebfkYOMV2V3E7egroQgliVc4v6mp7Xi9fdmPaxN3k3YUmeW123C8UvwdiNmy/pub?output=csv';
  
  let allData = {
    objects: [],
    articles: [],
    pictures: []
  };
  
  let photographersData = [];
  let filteredPhotographers = [];
  let filteredPlaces = [];
  let currentIndex = 'objects';
  let filteredImages = [];
  let currentImageIndex = -1;
  let universalSearchMode = false;
  let blogDataLoaded = false;

  // Expose to window for map module
  window.allData = allData;
  window.filteredImages = filteredImages;

  // ============================================================================
  // DATE PARSING UTILITIES
  // ============================================================================
  
  function parseDate(dateStr) {
    if (!dateStr) return '';
    
    const original = dateStr;
    dateStr = dateStr.trim();
    
    // Handle timestamp format (YYYY-MM-DD HH:MM:SS) FIRST
    if (dateStr.includes(' ')) {
      return dateStr.split(' ')[0];
    }
    
    // Handle text month formats
    const monthMap = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sept': '09', 'sep': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };
    
    const lowerDate = dateStr.toLowerCase();
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      if (lowerDate.includes(monthName)) {
        const parts = dateStr.replace(/[.,]/g, '').split(/\s+/);
        
        if (parts.length >= 3) {
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${monthNum}-${day}`;
        } else if (parts.length === 2) {
          const day = parts[1].padStart(2, '0');
          return `2025-${monthNum}-${day}`;
        }
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return dateStr;
      }
    }
    
    // Handle YYYY.MM.DD format
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    // Handle YYYY/MM/DD or MM/DD/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
    }
    
    // Just return year if only year is provided
    if (dateStr.length === 4 && !isNaN(dateStr)) {
      return dateStr;
    }
    
    return dateStr;
  }

  function formatArticleDate(dateStr) {
    if (!dateStr) return '';
    
    let cleanDate = dateStr.split(' ')[0].trim();
    let date;
    
    // Handle MM/DD/YYYY format (month-day-year)
    if (cleanDate.includes('/')) {
      const parts = cleanDate.split('/');
      if (parts.length === 3) {
        // Check if it's MM/DD/YYYY format (month first)
        if (parts[0].length <= 2 && parts[2].length === 4) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          date = new Date(`${year}-${month}-${day}`);
        }
        // Or YYYY/MM/DD format (year first)
        else if (parts[0].length === 4) {
          date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        }
      }
    }
    // Handle YYYY-MM-DD format
    else if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        date = new Date(cleanDate);
      }
    }
    // Handle YYYY.MM.DD format
    else if (cleanDate.includes('.')) {
      const parts = cleanDate.split('.');
      if (parts.length === 3) {
        date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      }
    }
    
    // If parsing failed, try native Date parsing
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateStr);
    }
    
    // If still invalid, return original string
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }

  function parseMonthYear(dateStr) {
    if (!dateStr) return null;
    
    const parts = dateStr.split('.');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[parseInt(month) - 1]}, ${year}`;
    }
    return null;
  }

  function parsePhotographerDate(dateStr) {
    if (!dateStr) return null;
    
    const native = new Date(dateStr);
    if (!isNaN(native)) return native;
    
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        month = parts[0];
        day = parts[1];
        year = parts[2];
      }
      return new Date(`${year}-${month}-${day}`);
    }
    
    return null;
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  
  async function fetchCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return parsed.data;
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

      // Process Americanisms and Objects
      const americanismsProcessed = americanismsData.map(row => ({
        src: row.src || row.Src || "",
        date: row.date || row.Date || "",
        sortDate: parseDate(row.date || row.Date || ""),
        location_card: (row.location_card || row.Location_card || "").replace(/\\n/g, '\n'),
        location_overlay: (row.location_overlay || row.Location_overlay || "").replace(/\\n/g, '\n'),
        medium: row.medium || row.Medium || "",
        artist: row.artist || row.Artist || "",
        keywords: row.keywords || row.Keywords || "",
        coordinates: row.I || row.coordinates || row.Coordinates || "", // Column I for coordinates
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
        coordinates: "",
        title: row.Title || row.title || "",
        note: row.Note || row.note || "",
        source: "Objects",
        type: "objects"
      })).filter(img => img.src);

      allData.objects = [...americanismsProcessed, ...objectsProcessed];

      // Process Articles
      allData.articles = articlesData.map(row => ({
        src: row.src || row.Src || "",
        photo: row.photo || row.Photo || "",
        date: row.date || row.Date || "",
        sortDate: parseDate(row.datereal || row.Datereal || row.date || row.Date || ""),
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

      // Process Photographers
      const allPeople = photographersListData
        .filter(row => {
          const hasFirst = row['First Name'] && row['First Name'].trim();
          const hasLast = row['Last Name'] && row['Last Name'].trim();
          return hasFirst && hasLast;
        })
        .map(row => {
          const person = {
            firstName: (row['First Name'] || '').trim(),
            lastName: (row['Last Name'] || '').trim(),
            website: (row['Website'] || '').trim(),
            className: (row['Class'] || '').trim(),
            dateAdded: (row['Date Added'] || '').trim(),
            allColumns: {}
          };
          
          Object.keys(row).forEach(key => {
            person.allColumns[key] = (row[key] || '').trim();
          });
          
          return person;
        });

      // Include all people who have a class specified (photographers, poets, fine artists, designers, etc.)
      photographersData = allPeople.filter(person => {
        return person.className && person.className.trim() !== '';
      });
      
      photographersData.sort((a, b) => a.lastName.localeCompare(b.lastName));

      // Sort all by date
      Object.keys(allData).forEach(key => {
        allData[key].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
      });

      // Update global references
      window.allData = allData;

      initUniversalSearch();
      switchIndex();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function loadPlaces() {
    try {
      const response = await fetch(placesURL);
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      placesData = parsed.data.map(row => ({
        src: row.src || '',
        test: row.test || '',
        date: row.date || ''
      })).filter(place => place.src && place.test);
      
      renderPlaces();
    } catch (error) {
      console.error('Error loading places:', error);
    }
  }

  async function loadBlogPosts() {
    try {
      const response = await fetch(blogPostsURL);
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      blogPostsData = parsed.data.map(row => ({
        title: row.Title || row.title || '',
        date: row.Date || row.date || '',
        pictures: row.Pictures || row.pictures || '',
        text: row.Text || row.text || '',
        link: row.Link || row.link || ''
      })).filter(post => post.title);
      
      renderBlogPosts();
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }

  async function loadInspoPosts() {
    try {
      const response = await fetch(inspoPostsURL);
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      inspoPostsData = parsed.data.map(row => ({
        name: row.Name || row.name || '',
        date: row.Date || row.date || '',
        pictures: row.Pictures || row.pictures || '',
        text: row.Text || row.text || '',
        link: row.Link || row.link || ''
      })).filter(post => post.name && post.link);
      
      renderInspoPosts();
    } catch (error) {
      console.error('Error loading inspo posts:', error);
    }
  }

  async function loadFieldNotes() {
    try {
      const response = await fetch(fieldNotesURL);
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      fieldNotesData = parsed.data.map(row => ({
        date: row.date || row.Date || row.A || '',
        title: row.title || row.Title || row.B || '',
        url: row.url || row.URL || row.D || '',
        image: row.image || row.Image || row.G || '',
        number: row.number || row.Number || row.M || ''
      })).filter(post => post.title);
      
      renderFieldNotes();
    } catch (error) {
      console.error('Error loading field notes:', error);
    }
  }

  async function loadAllBlogData() {
    if (blogDataLoaded) return;
    
    try {
      if (blogPostsData.length === 0) await loadBlogPosts();
      if (inspoPostsData.length === 0) await loadInspoPosts();
      if (fieldNotesData.length === 0) await loadFieldNotes();
      
      blogDataLoaded = true;
    } catch (error) {
      console.error('Error loading blog data:', error);
    }
  }

  // ============================================================================
  // SORTING
  // ============================================================================
  
  function sortFilteredImages(images) {
    const sorted = [...images];
    
    if (currentSortMode === 'NEWEST') {
      sorted.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    } else if (currentSortMode === 'OLDEST') {
      sorted.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
    } else if (currentSortMode === 'alphabetical') {
      sorted.sort((a, b) => {
        let aKey = '';
        let bKey = '';
        
        if (currentIndex === 'objects') {
          aKey = (a.title || a.location_card || '').toLowerCase();
          bKey = (b.title || b.location_card || '').toLowerCase();
        } else if (currentIndex === 'articles') {
          aKey = (a.source || '').toLowerCase();
          bKey = (b.source || '').toLowerCase();
        } else if (currentIndex === 'pictures') {
          aKey = (a.photographer || '').toLowerCase();
          bKey = (b.photographer || '').toLowerCase();
        }
        
        return aKey.localeCompare(bKey);
      });
    }
    
    return sorted;
  }

  window.cycleSortMode = function() {
    if (currentIndex === 'photographers' || currentIndex === 'places' || currentMode === 'blog') return;
    
    const modes = ['NEWEST', 'OLDEST', 'alphabetical'];
    const currentIdx = modes.indexOf(currentSortMode);
    currentSortMode = modes[(currentIdx + 1) % modes.length];
    
    const sortBtn = document.getElementById('sortButton');
    if (sortBtn) {
      const labels = {
        'NEWEST': 'NEWEST',
        'OLDEST': 'OLDEST',
        'alphabetical': 'A-Z'
      };
      sortBtn.textContent = labels[currentSortMode];
    }
    
    applyFilters();
  };

  function updateSortButtonVisibility() {
    const sortBtn = document.getElementById('sortButton');
    if (!sortBtn) return;
    
    if (currentIndex === 'photographers' || currentIndex === 'places' || currentMode === 'blog') {
      sortBtn.style.display = 'none';
    } else {
      sortBtn.style.display = 'flex';
    }
  }

  function updateFilterButtonsVisibility() {
    const filterRow = document.getElementById('filterButtonsRow');
    
    if (currentIndex === 'photographers' && currentMode === 'archive') {
      filterRow.style.display = 'flex';
    } else {
      filterRow.style.display = 'none';
    }
  }

  function updateMapButtonVisibility() {
    const mapBtn = document.getElementById('mapToggleBtn');
    if (!mapBtn) return;
    
    // Show map button ONLY on Objects page in Archive mode
    if (currentMode === 'archive' && currentIndex === 'objects') {
      mapBtn.style.display = 'block';
    } else {
      mapBtn.style.display = 'none';
      
      // Close map if it's open and user navigates away
      const mapContainer = document.getElementById('mapContainer');
      if (mapContainer && mapContainer.style.display === 'block') {
        if (typeof window.toggleMap === 'function') {
          window.toggleMap();
        }
      }
    }
  }

  // ============================================================================
  // RENDERING FUNCTIONS
  // ============================================================================
  
  function renderBlogPosts() {
    const postsContainer = document.getElementById('postsSection');
    postsContainer.innerHTML = '';
    
    if (blogPostsData.length === 0) {
      postsContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No blog posts found.</p>';
      return;
    }
    
    // Create image overlay if it doesn't exist
    let blogImageOverlay = document.getElementById('blogImageOverlay');
    if (!blogImageOverlay) {
      blogImageOverlay = document.createElement('div');
      blogImageOverlay.id = 'blogImageOverlay';
      blogImageOverlay.className = 'blog-image-overlay';
      blogImageOverlay.addEventListener('click', () => {
        blogImageOverlay.style.display = 'none';
        blogImageOverlay.innerHTML = '';
      });
      document.body.appendChild(blogImageOverlay);
    }
    
    blogPostsData.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'blog-post';
      
      // Header section with date, title, link, and thumbnail all on same line
      const headerDiv = document.createElement('div');
      headerDiv.className = 'blog-post-header';
      
      // Date
      const dateDiv = document.createElement('div');
      dateDiv.className = 'date';
      dateDiv.textContent = post.date;
      headerDiv.appendChild(dateDiv);
      
      // Title
      const titleH2 = document.createElement('h2');
      titleH2.textContent = post.title;
      headerDiv.appendChild(titleH2);
      
      // Link button
      if (post.link) {
        const linkButton = document.createElement('a');
        linkButton.href = post.link;
        linkButton.target = '_blank';
        linkButton.className = 'blog-link-button';
        linkButton.textContent = 'LINK';
        headerDiv.appendChild(linkButton);
      }
      
      // Thumbnail
      if (post.pictures) {
        const thumbnail = document.createElement('img');
        thumbnail.src = post.pictures;
        thumbnail.alt = post.title;
        thumbnail.className = 'blog-post-thumbnail';
        thumbnail.addEventListener('click', (e) => {
          e.preventDefault();
          const overlayImg = document.createElement('img');
          overlayImg.src = post.pictures;
          overlayImg.alt = post.title;
          blogImageOverlay.innerHTML = '';
          blogImageOverlay.appendChild(overlayImg);
          blogImageOverlay.style.display = 'flex';
        });
        headerDiv.appendChild(thumbnail);
      }
      
      postDiv.appendChild(headerDiv);
      
      // Text content
      if (post.text) {
        const textP = document.createElement('p');
        // Make sure all links within the text have target="_blank"
        let textWithTargetBlank = post.text.replace(/<a\s+href=/gi, '<a target="_blank" href=');
        textP.innerHTML = textWithTargetBlank;
        postDiv.appendChild(textP);
      }
      
      postsContainer.appendChild(postDiv);
    });
    
    if (currentMode === 'blog') {
      updateBlogItemCount();
    }
  }

  function renderInspoPosts() {
    const inspoContainer = document.getElementById('inspoSection');
    inspoContainer.innerHTML = '';
    
    if (inspoPostsData.length === 0) {
      inspoContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No inspo posts found.</p>';
      return;
    }
    
    // Group by month-year
    const groupedByMonth = {};
    inspoPostsData.forEach(post => {
      const monthYear = parseMonthYear(post.date) || 'No Date';
      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = [];
      }
      groupedByMonth[monthYear].push(post);
    });
    
    // Sort month-year keys in reverse chronological order
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return b.localeCompare(a);
    });
    
    sortedMonths.forEach(monthYear => {
      // Month header (collapsible)
      const monthHeader = document.createElement('div');
      monthHeader.className = 'inspo-month-header';
      monthHeader.textContent = monthYear;
      monthHeader.style.cursor = 'pointer';
      monthHeader.style.fontWeight = 'bold';
      monthHeader.style.fontSize = '18px';
      monthHeader.style.marginTop = '20px';
      monthHeader.style.marginBottom = '10px';
      monthHeader.style.userSelect = 'none';
      
      // Links container
      const linksContainer = document.createElement('div');
      linksContainer.className = 'inspo-links-container';
      linksContainer.style.display = 'none'; // Start collapsed
      linksContainer.style.marginLeft = '20px';
      
      groupedByMonth[monthYear].forEach(post => {
        const linkWrapper = document.createElement('div');
        linkWrapper.style.marginBottom = '8px';
        
        const link = document.createElement('a');
        link.href = post.link;
        link.target = '_blank';
        link.textContent = post.name;
        link.style.fontSize = '16px';
        link.style.textDecoration = 'underline';
        link.style.color = '#000';
        
        linkWrapper.appendChild(link);
        linksContainer.appendChild(linkWrapper);
      });
      
      // Toggle functionality
      monthHeader.addEventListener('click', () => {
        if (linksContainer.style.display === 'none') {
          linksContainer.style.display = 'block';
        } else {
          linksContainer.style.display = 'none';
        }
      });
      
      inspoContainer.appendChild(monthHeader);
      inspoContainer.appendChild(linksContainer);
    });
    
    if (currentMode === 'blog') {
      updateBlogItemCount();
    }
  }

  function renderFieldNotes() {
    const fieldNotesContainer = document.getElementById('fieldNotesSection');
    fieldNotesContainer.innerHTML = '';
    
    if (fieldNotesData.length === 0) {
      fieldNotesContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No field notes found.</p>';
      return;
    }
    
    let hoverImg = document.getElementById('fieldNoteHoverImage');
    if (!hoverImg) {
      hoverImg = document.createElement('img');
      hoverImg.id = 'fieldNoteHoverImage';
      document.body.appendChild(hoverImg);
    }
    
    fieldNotesData.forEach(note => {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'field-note-item';
      noteDiv.style.display = 'flex';
      noteDiv.style.justifyContent = 'space-between';
      noteDiv.style.alignItems = 'baseline';
      noteDiv.style.marginBottom = '8px';
      noteDiv.style.fontSize = '16px';
      
      const titleLink = document.createElement('a');
      titleLink.href = note.url || '#';
      titleLink.target = '_blank';
      titleLink.className = 'field-note-title';
      titleLink.textContent = note.number ? `${note.number} - ${note.title}` : note.title;
      titleLink.style.textDecoration = 'underline';
      titleLink.style.color = '#000';
      titleLink.style.flex = '1';
      
      if (note.image) {
        titleLink.addEventListener('mouseenter', () => {
          hoverImg.src = note.image;
          hoverImg.style.display = 'block';
        });
        titleLink.addEventListener('mouseleave', () => {
          hoverImg.style.display = 'none';
        });
      }
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'field-note-date';
      dateDiv.textContent = note.date;
      dateDiv.style.fontSize = '14px';
      dateDiv.style.color = '#666';
      dateDiv.style.marginLeft = '20px';
      dateDiv.style.whiteSpace = 'nowrap';
      
      noteDiv.appendChild(titleLink);
      noteDiv.appendChild(dateDiv);
      fieldNotesContainer.appendChild(noteDiv);
    });
    
    if (currentMode === 'blog') {
      updateBlogItemCount();
    }
  }

  function renderPlaces() {
    const searchTerm = document.getElementById('placesSearch').value.toLowerCase();
    
    filteredPlaces = placesData.filter(place => {
      const searchableText = [place.test, place.date, place.src].join(' ').toLowerCase();
      return searchableText.includes(searchTerm);
    });
    
    const list = document.getElementById('placesList');
    list.innerHTML = '';
    
    if (filteredPlaces.length === 0) {
      list.innerHTML = '<p style="font-size: 18px; color: #666;">No places found</p>';
      updateImageCount(0);
      return;
    }
    
    // Sort alphabetically by place name
    filteredPlaces.sort((a, b) => a.test.localeCompare(b.test));
    
    // Group by first letter
    const groupedByLetter = {};
    filteredPlaces.forEach(place => {
      const firstLetter = place.test[0].toUpperCase();
      if (!groupedByLetter[firstLetter]) {
        groupedByLetter[firstLetter] = [];
      }
      groupedByLetter[firstLetter].push(place);
    });
    
    const letters = Object.keys(groupedByLetter).sort();
    
    letters.forEach(letter => {
      // Section divider
      const divider = document.createElement('div');
      divider.className = 'section-divider';
      list.appendChild(divider);
      
      // Letter header
      const header = document.createElement('div');
      header.className = 'letter-header';
      header.textContent = letter;
      list.appendChild(header);
      
      // Two-column grid
      const grid = document.createElement('div');
      grid.className = 'two-column';
      
      groupedByLetter[letter].forEach(place => {
        const placeItem = document.createElement('div');
        placeItem.className = 'place-item';
        
        const link = document.createElement('a');
        link.href = place.src;
        link.target = '_blank';
        link.textContent = place.test;
        
        placeItem.appendChild(link);
        grid.appendChild(placeItem);
      });
      
      list.appendChild(grid);
    });
    
    updateImageCount(filteredPlaces.length);
  }

  function renderImages(imageArray) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    
    gallery.className = '';
    if (currentIndex === 'objects') {
      gallery.classList.add('objects-view');
    } else if (currentIndex === 'articles') {
      gallery.classList.add('articles-view');
    }
    
    imageArray.forEach((img, index) => {
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
          <div class="article-date">${formatArticleDate(img.date)}</div>
          <div class="article-source">${img.source}</div>
        `;
        
        link.appendChild(thumbnail);
        link.appendChild(info);
        card.appendChild(link);
        gallery.appendChild(card);
      } else {
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
    
    filteredPhotographers = photographersData.filter(p => {
      const searchableFields = [
        p.firstName,
        p.lastName,
        p.website,
        p.className,
        p.dateAdded
      ];
      
      if (p.allColumns) {
        Object.values(p.allColumns).forEach(value => {
          searchableFields.push(value);
        });
      }
      
      const searchableText = searchableFields.join(' ').toLowerCase();
      return searchableText.includes(searchTerm);
    });
    
    const list = document.getElementById('photographersList');
    list.innerHTML = '';
    
    if (filteredPhotographers.length === 0) {
      list.innerHTML = '<p style="font-size: 18px; color: #666;">No photographers found</p>';
      document.getElementById('highlightCount').textContent = '0';
      return;
    }
    
    const groupedByLetter = {};
    filteredPhotographers.forEach(p => {
      const firstLetter = p.lastName[0].toUpperCase();
      if (!groupedByLetter[firstLetter]) {
        groupedByLetter[firstLetter] = [];
      }
      groupedByLetter[firstLetter].push(p);
    });
    
    const letters = Object.keys(groupedByLetter).sort();
    const today = new Date();
    
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

  // ============================================================================
  // UNIVERSAL SEARCH
  // ============================================================================
  
  function initUniversalSearch() {
    const searchInput = document.getElementById('topSearchInput');
    
    if (searchInput) {
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      newSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length > 0) {
          performUniversalSearch(query);
        } else {
          clearUniversalSearch();
        }
      });
    }
    
    loadAllBlogData();
  }

  function performUniversalSearch(query) {
    universalSearchMode = true;
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    // Search Objects
    allData.objects.forEach(item => {
      const searchText = [
        item.title, item.date, item.medium, item.artist,
        item.location_card, item.location_overlay, item.keywords, item.note, item.source
      ].join(' ').toLowerCase();
      
      if (searchText.includes(lowerQuery)) {
        results.push({ type: 'object', data: item });
      }
    });
    
    // Search Articles
    allData.articles.forEach(item => {
      const searchText = [item.date, item.source, item.src].join(' ').toLowerCase();
      if (searchText.includes(lowerQuery)) {
        results.push({ type: 'article', data: item });
      }
    });
    
    // Search Pictures
    allData.pictures.forEach(item => {
      const searchText = [item.date, item.photographer, item.note].join(' ').toLowerCase();
      if (searchText.includes(lowerQuery)) {
        results.push({ type: 'picture', data: item });
      }
    });
    
    // Search Photographers
    photographersData.forEach(item => {
      const searchableFields = [
        item.firstName,
        item.lastName,
        item.website,
        item.className,
        item.dateAdded
      ];
      
      if (item.allColumns) {
        Object.values(item.allColumns).forEach(value => {
          searchableFields.push(value);
        });
      }
      
      const searchText = searchableFields.join(' ').toLowerCase();
      
      if (searchText.includes(lowerQuery)) {
        results.push({ type: 'photographer', data: item });
      }
    });
    
    // Search Places
    if (placesData.length > 0) {
      placesData.forEach(item => {
        const searchText = [item.test, item.date, item.src].join(' ').toLowerCase();
        if (searchText.includes(lowerQuery)) {
          results.push({ type: 'place', data: item });
        }
      });
    }
    
    // Search Blog Posts
    if (blogPostsData.length > 0) {
      blogPostsData.forEach(item => {
        const searchText = [item.title, item.date, item.text].join(' ').toLowerCase();
        if (searchText.includes(lowerQuery)) {
          results.push({ type: 'blog-post', data: item });
        }
      });
    }
    
    // Search Inspo Posts
    if (inspoPostsData.length > 0) {
      inspoPostsData.forEach(item => {
        const searchText = [item.name, item.date, item.text, item.link].join(' ').toLowerCase();
        if (searchText.includes(lowerQuery)) {
          results.push({ type: 'inspo', data: item });
        }
      });
    }
    
    // Search Field Notes
    if (fieldNotesData.length > 0) {
      fieldNotesData.forEach(item => {
        const searchText = [item.title, item.date, item.number].join(' ').toLowerCase();
        if (searchText.includes(lowerQuery)) {
          results.push({ type: 'field-note', data: item });
        }
      });
    }
    
    renderUniversalSearchResults(results);
  }

  function renderUniversalSearchResults(results) {
    const gallery = document.getElementById('gallery');
    const photographersContent = document.getElementById('photographersContent');
    const placesContent = document.getElementById('placesContent');
    const blogContent = document.getElementById('blogContent');
    
    photographersContent.classList.remove('active');
    placesContent.classList.remove('active');
    blogContent.classList.remove('active');
    
    gallery.style.display = 'grid';
    gallery.className = '';
    gallery.innerHTML = '';
    
    updateImageCount(results.length);
    
    if (results.length === 0) {
      gallery.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; font-size: 18px;">No results found</div>';
      return;
    }
    
    results.forEach(result => {
      const card = createSearchResultCard(result);
      gallery.appendChild(card);
    });
  }

  function createSearchResultCard(result) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.style.cssText = `
      background: #fff;
      border: 2px solid #000;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 200px;
    `;
    
    const badge = document.createElement('div');
    badge.style.cssText = 'font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;';
    badge.textContent = result.type.toUpperCase();
    card.appendChild(badge);
    
    switch(result.type) {
      case 'object':
      case 'picture':
        if (result.data.src) {
          const img = document.createElement('img');
          img.src = result.data.src;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: contain; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; font-size: 14px;';
        title.textContent = result.data.title || result.data.photographer || result.data.location_card || 'Item';
        card.appendChild(title);
        
        const date = document.createElement('div');
        date.style.cssText = 'font-size: 12px; color: #666;';
        date.textContent = result.data.date;
        card.appendChild(date);
        
        card.onclick = () => {
          const sourceArray = result.type === 'object' ? allData.objects : allData.pictures;
          const index = sourceArray.findIndex(i => i.src === result.data.src);
          if (index !== -1) {
            filteredImages = sourceArray;
            window.filteredImages = sourceArray;
            showOverlay(index);
          }
        };
        break;
        
      case 'article':
        if (result.data.photo) {
          const img = document.createElement('img');
          img.src = result.data.photo;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const articleTitle = document.createElement('div');
        articleTitle.style.cssText = 'font-weight: bold; font-size: 14px;';
        articleTitle.textContent = result.data.source || 'Article';
        card.appendChild(articleTitle);
        
        const articleDate = document.createElement('div');
        articleDate.style.cssText = 'font-size: 12px; color: #666;';
        articleDate.textContent = formatArticleDate(result.data.date);
        card.appendChild(articleDate);
        
        card.onclick = () => window.open(result.data.src, '_blank');
        break;
        
      case 'photographer':
        const name = document.createElement('div');
        name.style.cssText = 'font-weight: bold; font-size: 18px;';
        name.textContent = `${result.data.firstName} ${result.data.lastName}`;
        card.appendChild(name);
        
        card.onclick = () => window.open(result.data.website, '_blank');
        break;
        
      case 'place':
        const placeTitle = document.createElement('div');
        placeTitle.style.cssText = 'font-weight: bold; font-size: 14px;';
        placeTitle.textContent = result.data.test || 'Place';
        card.appendChild(placeTitle);
        
        const placeDate = document.createElement('div');
        placeDate.style.cssText = 'font-size: 12px; color: #666;';
        placeDate.textContent = result.data.date;
        card.appendChild(placeDate);
        
        card.onclick = () => window.open(result.data.src, '_blank');
        break;
        
      case 'blog-post':
        if (result.data.pictures) {
          const img = document.createElement('img');
          img.src = result.data.pictures;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const postTitle = document.createElement('div');
        postTitle.style.cssText = 'font-weight: bold; font-size: 14px;';
        postTitle.textContent = result.data.title || 'Blog Post';
        card.appendChild(postTitle);
        
        card.onclick = () => {
          document.getElementById('modeSelector').value = 'blog';
          switchMode();
        };
        break;
        
      case 'inspo':
        const inspoName = document.createElement('div');
        inspoName.style.cssText = 'font-weight: bold; font-size: 14px;';
        inspoName.textContent = result.data.name || 'Inspo';
        card.appendChild(inspoName);
        
        if (result.data.link) {
          card.onclick = () => window.open(result.data.link, '_blank');
        }
        break;
        
      case 'field-note':
        if (result.data.image) {
          const img = document.createElement('img');
          img.src = result.data.image;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const noteTitle = document.createElement('div');
        noteTitle.style.cssText = 'font-weight: bold; font-size: 14px;';
        const titleText = result.data.number ? `${result.data.number} - ${result.data.title}` : result.data.title;
        noteTitle.textContent = titleText || 'Field Note';
        card.appendChild(noteTitle);
        
        if (result.data.url) {
          card.onclick = () => window.open(result.data.url, '_blank');
        }
        break;
    }
    
    card.onmouseenter = () => {
      card.style.backgroundColor = '#f5f5f5';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    };
    
    card.onmouseleave = () => {
      card.style.backgroundColor = '#fff';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    };
    
    return card;
  }

  function clearUniversalSearch() {
    if (!universalSearchMode) return;
    
    universalSearchMode = false;
    
    const currentModeValue = document.getElementById('modeSelector').value;
    const currentIndexValue = document.getElementById('indexSelector').value;
    
    if (currentModeValue === 'blog') {
      document.getElementById('blogContent').classList.add('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('placesContent').classList.remove('active');
    } else {
      document.getElementById('blogContent').classList.remove('active');
      
      if (currentIndexValue === 'photographers') {
        document.getElementById('photographersContent').classList.add('active');
        document.getElementById('placesContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'none';
        renderPhotographers();
      } else if (currentIndexValue === 'places') {
        document.getElementById('placesContent').classList.add('active');
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'none';
        renderPlaces();
      } else {
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('placesContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'grid';
        applyFilters();
      }
    }
  }

  // ============================================================================
  // NAVIGATION & MODE SWITCHING
  // ============================================================================
  
  window.navigateTo = function(mode, section) {
    // Update active state on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${mode}-${section}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Update hidden selectors
    document.getElementById('modeSelector').value = mode;
    
    if (mode === 'blog') {
      document.getElementById('blogSelector').value = section;
      currentMode = 'blog';
      
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('placesContent').classList.remove('active');
      document.getElementById('blogContent').classList.add('active');
      document.getElementById('rightSidebar').classList.remove('open');
      
      showBlogSection(section);
      updateBlogItemCount();
      updateSortButtonVisibility();
      updateMapButtonVisibility();
      
      if (section === 'posts' && blogPostsData.length === 0) {
        loadBlogPosts();
      } else if (section === 'inspo' && inspoPostsData.length === 0) {
        loadInspoPosts();
      } else if (section === 'fieldNotes' && fieldNotesData.length === 0) {
        loadFieldNotes();
      }
    } else {
      // Archive mode
      document.getElementById('indexSelector').value = section;
      currentMode = 'archive';
      currentIndex = section;
      
      document.getElementById('blogContent').classList.remove('active');
      
      if (section === 'photographers') {
        document.getElementById('photographersContent').classList.add('active');
        document.getElementById('placesContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('rightSidebar').classList.remove('open');
        renderPhotographers();
        updateImageCount(photographersData.length);
      } else if (section === 'places') {
        document.getElementById('placesContent').classList.add('active');
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('rightSidebar').classList.remove('open');
        if (placesData.length === 0) {
          loadPlaces();
        } else {
          renderPlaces();
        }
      } else {
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('placesContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'grid';
        
        updateFilterVisibility();
        applyFilters();
      }
      
      updateSortButtonVisibility();
      updateFilterButtonsVisibility();
      updateMapButtonVisibility();
    }
  };
  
  window.switchMode = function() {
    if (universalSearchMode) return;
    
    currentMode = document.getElementById('modeSelector').value;
    
    if (currentMode === 'blog') {
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('placesContent').classList.remove('active');
      document.getElementById('blogContent').classList.add('active');
      document.getElementById('rightSidebar').classList.remove('open');
      
      updateBlogItemCount();
      updateSortButtonVisibility();
      updateMapButtonVisibility();
      
      if (blogPostsData.length === 0) {
        loadBlogPosts();
      }
    } else {
      document.getElementById('blogContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'grid';
      switchIndex();
    }
  };

  window.switchIndex = function() {
    if (universalSearchMode) return;
    
    currentIndex = document.getElementById('indexSelector').value;
    
    if (currentIndex === 'photographers') {
      document.getElementById('photographersContent').classList.add('active');
      document.getElementById('placesContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('rightSidebar').classList.remove('open');
      renderPhotographers();
      updateImageCount(photographersData.length);
    } else if (currentIndex === 'places') {
      document.getElementById('placesContent').classList.add('active');
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('rightSidebar').classList.remove('open');
      if (placesData.length === 0) {
        loadPlaces();
      } else {
        renderPlaces();
      }
    } else {
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('placesContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'grid';
      
      updateFilterVisibility();
      applyFilters();
    }
    
    updateSortButtonVisibility();
    updateFilterButtonsVisibility();
    updateMapButtonVisibility();
  };

  window.switchBlogSection = function() {
    const section = document.getElementById('blogSelector').value;
    showBlogSection(section);
    updateBlogItemCount();
  };

  function showBlogSection(section) {
    document.querySelectorAll('.blog-section').forEach(s => s.classList.remove('active'));
    document.getElementById('blogSelector').value = section;
    
    if (section === 'posts') {
      document.getElementById('postsSection').classList.add('active');
    } else if (section === 'inspo') {
      document.getElementById('inspoSection').classList.add('active');
      if (inspoPostsData.length === 0) {
        loadInspoPosts();
      }
    } else if (section === 'fieldNotes') {
      document.getElementById('fieldNotesSection').classList.add('active');
      if (fieldNotesData.length === 0) {
        loadFieldNotes();
      }
    }
    
    if (currentMode === 'blog') {
      updateBlogItemCount();
    }
  }

  function updateBlogItemCount() {
    const currentSection = document.getElementById('blogSelector').value;
    let count = 0;
    
    if (currentSection === 'posts') {
      count = blogPostsData.length;
    } else if (currentSection === 'inspo') {
      count = inspoPostsData.length;
    } else if (currentSection === 'fieldNotes') {
      count = fieldNotesData.length;
    }
    
    document.getElementById('imageCount').textContent = `${count} items`;
  }

  // ============================================================================
  // FILTERS
  // ============================================================================
  
  function updateFilterVisibility() {
    document.getElementById('mediumFilter').style.display = 'none';
    document.getElementById('photographerFilter').style.display = 'none';
    document.getElementById('sourceFilter').style.display = 'none';
    
    if (currentIndex === 'objects') {
      document.getElementById('mediumFilter').style.display = 'block';
      document.getElementById('sourceFilter').style.display = 'block';
      createMediumCheckboxes();
      createObjectSourceCheckboxes();
    } else if (currentIndex === 'pictures') {
      document.getElementById('photographerFilter').style.display = 'block';
      createPhotographerCheckboxes();
    } else if (currentIndex === 'articles') {
      document.getElementById('sourceFilter').style.display = 'block';
      createArticleSourceCheckboxes();
    }
  }

  function createMediumCheckboxes() {
    const container = document.getElementById('mediumCheckboxes');
    container.innerHTML = '';
    
    const mediums = new Set();
    allData.objects.forEach(img => {
      if (img.medium) mediums.add(img.medium);
    });
    
    if (mediums.size === 0) {
      container.innerHTML = '<p style="font-size: 12px; color: #999;">No mediums available</p>';
      return;
    }
    
    Array.from(mediums).sort().forEach(medium => {
      const item = document.createElement('div');
      item.className = 'checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'medium_' + medium.replace(/\s/g, '_');
      checkbox.value = medium;
      checkbox.checked = true;
      checkbox.onchange = applyFilters;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = medium;
      
      item.appendChild(checkbox);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  function createObjectSourceCheckboxes() {
    const container = document.getElementById('sourceCheckboxes');
    container.innerHTML = '';
    
    const sources = new Set();
    allData.objects.forEach(img => {
      if (img.source) sources.add(img.source);
    });
    
    Array.from(sources).sort().forEach(source => {
      const item = document.createElement('div');
      item.className = 'checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'objsource_' + source.replace(/\s/g, '_');
      checkbox.value = source;
      checkbox.checked = true;
      checkbox.onchange = applyFilters;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = source;
      
      item.appendChild(checkbox);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  function createPhotographerCheckboxes() {
    const container = document.getElementById('photographerCheckboxes');
    container.innerHTML = '';
    
    const photographers = new Set();
    allData.pictures.forEach(img => {
      if (img.photographer) photographers.add(img.photographer);
    });
    
    if (photographers.size === 0) {
      container.innerHTML = '<p style="font-size: 12px; color: #999;">No photographers available</p>';
      return;
    }
    
    Array.from(photographers).sort().forEach(photographer => {
      const item = document.createElement('div');
      item.className = 'checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'photographer_' + photographer.replace(/\s/g, '_');
      checkbox.value = photographer;
      checkbox.checked = true;
      checkbox.onchange = applyFilters;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = photographer;
      
      item.appendChild(checkbox);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  function createArticleSourceCheckboxes() {
    const container = document.getElementById('sourceCheckboxes');
    container.innerHTML = '';
    
    const sources = new Set();
    allData.articles.forEach(img => {
      if (img.source) sources.add(img.source);
    });
    
    if (sources.size === 0) {
      container.innerHTML = '<p style="font-size: 12px; color: #999;">No sources available</p>';
      return;
    }
    
    Array.from(sources).sort().forEach(source => {
      const item = document.createElement('div');
      item.className = 'checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'source_' + source.replace(/\s/g, '_');
      checkbox.value = source;
      checkbox.checked = true;
      checkbox.onchange = applyFilters;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = source;
      
      item.appendChild(checkbox);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  function applyFilters() {
    const searchInput = document.getElementById('topSearchInput');
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (keyword) {
      performUniversalSearch(keyword);
      return;
    }
    
    universalSearchMode = false;
    
    if (currentIndex === 'photographers') {
      document.getElementById('photographersContent').classList.add('active');
      document.getElementById('placesContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('blogContent')?.classList.remove('active');
      renderPhotographers();
      return;
    } else if (currentIndex === 'places') {
      document.getElementById('placesContent').classList.add('active');
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('blogContent')?.classList.remove('active');
      renderPlaces();
      return;
    } else if (currentMode === 'blog') {
      document.getElementById('blogContent').classList.add('active');
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('placesContent').classList.remove('active');
      return;
    }
    
    document.getElementById('photographersContent').classList.remove('active');
    document.getElementById('placesContent').classList.remove('active');
    document.getElementById('blogContent')?.classList.remove('active');
    document.getElementById('gallery').style.display = 'grid';
    
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    let currentData = allData[currentIndex];
    
    filteredImages = currentData.filter(img => {
      if (dateFrom && img.sortDate < dateFrom) return false;
      if (dateTo && img.sortDate > dateTo) return false;
      
      if (currentIndex === 'objects') {
        const selectedMediums = Array.from(document.querySelectorAll('#mediumCheckboxes input:checked'))
          .map(cb => cb.value);
        const selectedSources = Array.from(document.querySelectorAll('#sourceCheckboxes input:checked'))
          .map(cb => cb.value);
        
        if (selectedMediums.length > 0 && img.medium && !selectedMediums.includes(img.medium)) {
          return false;
        }
        if (selectedSources.length > 0 && img.source && !selectedSources.includes(img.source)) {
          return false;
        }
      } else if (currentIndex === 'pictures') {
        const selectedPhotographers = Array.from(document.querySelectorAll('#photographerCheckboxes input:checked'))
          .map(cb => cb.value);
        if (selectedPhotographers.length > 0 && img.photographer && !selectedPhotographers.includes(img.photographer)) {
          return false;
        }
      } else if (currentIndex === 'articles') {
        const selectedSources = Array.from(document.querySelectorAll('#sourceCheckboxes input:checked'))
          .map(cb => cb.value);
        if (selectedSources.length > 0 && img.source && !selectedSources.includes(img.source)) {
          return false;
        }
      }
      
      return true;
    });
    
    filteredImages = sortFilteredImages(filteredImages);
    window.filteredImages = filteredImages; // Update global reference
    renderImages(filteredImages);
    updateImageCount(filteredImages.length);
  }

  window.clearFilters = function() {
    document.getElementById('topSearchInput').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.querySelectorAll('.checkbox-group input').forEach(cb => cb.checked = true);
    currentSortMode = 'NEWEST';
    const sortBtn = document.getElementById('sortButton');
    if (sortBtn) sortBtn.textContent = 'NEWEST';
    universalSearchMode = false;
    applyFilters();
  };

  function updateImageCount(count) {
    document.getElementById('imageCount').textContent = `${count} ${universalSearchMode ? 'results' : 'items'}`;
  }

  // ============================================================================
  // OVERLAY
  // ============================================================================
  
  function showOverlay(index) {
    currentImageIndex = index;
    const img = filteredImages[index];
    
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
  
  // Expose showOverlay to window for map module
  window.showOverlay = showOverlay;

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

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================
  
  function initEventListeners() {
    document.getElementById("overlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("overlay")) {
        hideOverlay();
      }
    });
    
    document.getElementById("fullscreenBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
    
    document.getElementById("closeBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      hideOverlay();
    });
    
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
    
    document.getElementById('photographersSearch').addEventListener('input', renderPhotographers);
    
    const placesSearch = document.getElementById('placesSearch');
    if (placesSearch) {
      placesSearch.addEventListener('input', renderPlaces);
    }
    
    // Filter buttons row handlers
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        if (filter === 'random') {
          // Open random photographer
          if (photographersData.length > 0) {
            const randomPhotographer = photographersData[Math.floor(Math.random() * photographersData.length)];
            if (randomPhotographer && randomPhotographer.website) {
              window.open(randomPhotographer.website, '_blank');
            }
          }
        } else {
          // Apply filter via search - search in className (F column)
          const searchInput = document.getElementById('photographersSearch');
          if (filter === 'all') {
            searchInput.value = '';
          } else {
            // Set search to the filter term which will search className
            searchInput.value = filter;
          }
          
          // Update active state
          filterButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Trigger search
          renderPhotographers();
        }
      });
    });
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  function init() {
    initEventListeners();
    updateSortButtonVisibility();
    updateMapButtonVisibility();
    loadAllData();
    
    // Set default active nav link
    const defaultLink = document.querySelector('[data-section="archive-objects"]');
    if (defaultLink) {
      defaultLink.classList.add('active');
    }
  }

  // Wait for DOM and Papa Parse to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
