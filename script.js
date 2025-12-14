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
    let currentIndex = 'objects';
    let filteredImages = [];
    let currentImageIndex = -1;

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
    }
    
    function toggleSearch() {
      const searchInput = document.getElementById('topSearchInput');
      searchInput.classList.toggle('active');
      if (searchInput.classList.contains('active')) {
        searchInput.focus();
      }
    }

    function parseDate(dateStr) {
      if (!dateStr) return '';
      
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
      
      // Handle YYYY-MM-DD format
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          return dateStr;
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
      
      // Handle timestamp format (YYYY-MM-DD HH:MM:SS)
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0];
      }
      
      // Just return year if only year is provided
      if (dateStr.length === 4 && !isNaN(dateStr)) {
        return dateStr;
      }
      
      return dateStr;
    }

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

    function updateFilterVisibility() {
      // Hide all filter sections
      document.getElementById('mediumFilter').style.display = 'none';
      document.getElementById('photographerFilter').style.display = 'none';
      document.getElementById('sourceFilter').style.display = 'none';

      // Show relevant filters
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
      // Skip if we're in photographers view
      if (currentIndex === 'photographers') return;
      
      const keyword = document.getElementById('topSearchInput').value.toLowerCase();
      const dateFrom = document.getElementById('dateFrom').value;
      const dateTo = document.getElementById('dateTo').value;
      
      let currentData = allData[currentIndex];
      
      filteredImages = currentData.filter(img => {
        // Keyword filter
        if (keyword) {
          const searchText = Object.values(img).join(' ').toLowerCase();
          if (!searchText.includes(keyword)) return false;
        }

        // Date filter
        if (dateFrom && img.sortDate < dateFrom) return false;
        if (dateTo && img.sortDate > dateTo) return false;

        // Type-specific filters
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

      renderImages(filteredImages);
      updateImageCount(filteredImages.length);
    }

    function clearFilters() {
      document.getElementById('topSearchInput').value = '';
      document.getElementById('dateFrom').value = '';
      document.getElementById('dateTo').value = '';
      document.querySelectorAll('.checkbox-group input').forEach(cb => cb.checked = true);
      applyFilters();
    }

    function updateImageCount(count) {
      document.getElementById('imageCount').textContent = `${count} items`;
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

    document.getElementById('topSearchInput').addEventListener('input', applyFilters);
    
    // Photographers search functionality
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

    loadAllData();
