    let currentMode = 'archive';
    let currentSortMode = 'date-desc';
    let blogPostsData = [];
    let inspoPostsData = [];
    let fieldNotesData = [];
    const blogPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThaJ-Q5u7zUSy9DA5oMCUkajzPdkWpECZzQf7SYpi8SvSCqvRgzlQvAUI6xAtaumQEnsaHSbYLkHt_/pub?output=csv';
    const inspoPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtF8T2xKCyuDXq1_hyxL0Do2g8wfQ5AtrA-SlKSoUa5TlyuaKgekwK4j4ezU1z8dVjf5P8YYVnoXT9/pub?output=csv';
    const fieldNotesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv';
    
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
    let universalSearchMode = false;
    
    function applySorting() {
      currentSortMode = document.getElementById('sortSelector').value;
      applyFilters();
    }
    
    function sortImages(imageArray) {
      const sorted = [...imageArray];
      
      console.log('=== SORTING DEBUG ===');
      console.log('Sorting with mode:', currentSortMode);
      console.log('First 5 articles with dates:');
      sorted.slice(0, 5).forEach((item, i) => {
        console.log(`  ${i+1}. Display date: "${item.date}" | Sort date: "${item.sortDate}" | Source: ${item.source}`);
      });
      
      if (currentSortMode === 'date-desc') {
        sorted.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
      } else if (currentSortMode === 'date-asc') {
        sorted.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
      } else if (currentSortMode === 'random') {
        // Fisher-Yates shuffle
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
      }
      
      console.log('After sorting, first 5:');
      sorted.slice(0, 5).forEach((item, i) => {
        console.log(`  ${i+1}. Display date: "${item.date}" | Sort date: "${item.sortDate}" | Source: ${item.source}`);
      });
      console.log('===================');
      
      return sorted;
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
        
        console.log('Loaded blog posts:', blogPostsData);
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
        
        console.log('Loaded inspo posts:', inspoPostsData);
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
        
        console.log('Loaded field notes:', fieldNotesData);
        renderFieldNotes();
      } catch (error) {
        console.error('Error loading field notes:', error);
      }
    }
    
    function parseMonthYear(dateStr) {
      if (!dateStr) return null;
      
      // Handle YYYY.MM.DD format
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
    
    function renderInspoPosts() {
      const inspoContainer = document.getElementById('inspoSection');
      inspoContainer.innerHTML = '';
      
      if (inspoPostsData.length === 0) {
        inspoContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No inspo posts found.</p>';
        return;
      }
      
      // Group by month/year
      const groupedByMonth = {};
      inspoPostsData.forEach(post => {
        const monthYear = parseMonthYear(post.date);
        if (monthYear) {
          if (!groupedByMonth[monthYear]) {
            groupedByMonth[monthYear] = [];
          }
          groupedByMonth[monthYear].push(post);
        }
      });
      
      // Sort months (newest first)
      const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split(', ');
        const [monthB, yearB] = b.split(', ');
        if (yearB !== yearA) return yearB - yearA;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
      });
      
      // Render each month
      sortedMonths.forEach(monthYear => {
        const monthDiv = document.createElement('div');
        monthDiv.style.marginBottom = '40px';
        
const monthHeader = document.createElement('h2');
monthHeader.textContent = monthYear;
monthHeader.style.fontSize = '28px';  // or whatever size you want
monthHeader.style.fontWeight = 'bold';
monthHeader.style.fontFamily = 'Helvetica';  // or whatever font you want
monthHeader.style.marginBottom = '15px';
monthDiv.appendChild(monthHeader);
        
        // Sort posts alphabetically by name within the month
        const sortedPosts = groupedByMonth[monthYear].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        // Create paragraph of links
        const linksP = document.createElement('p');
        linksP.style.fontSize = '16px';
        linksP.style.lineHeight = '1.0';
        
        const linkTexts = sortedPosts.map(post => 
          `<a href="${post.link}" target="_blank" class="inspo-link">${post.name}</a>`
        );
        
        linksP.innerHTML = linkTexts.join(', ');
        monthDiv.appendChild(linksP);
        
        inspoContainer.appendChild(monthDiv);
      });
      
      // Update count if in blog mode
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
      
      // Add hover image element
      let hoverImg = document.getElementById('fieldNoteHoverImage');
      if (!hoverImg) {
        hoverImg = document.createElement('img');
        hoverImg.id = 'fieldNoteHoverImage';
        document.body.appendChild(hoverImg);
      }
      
      fieldNotesData.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'field-note-item';
        
        const titleLink = document.createElement('a');
        titleLink.href = note.url || '#';
        titleLink.target = '_blank';
        titleLink.className = 'field-note-title';
        titleLink.textContent = note.number ? `${note.number} - ${note.title}` : note.title;
        
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
        
        noteDiv.appendChild(titleLink);
        noteDiv.appendChild(dateDiv);
        fieldNotesContainer.appendChild(noteDiv);
      });
      
      // Update count if in blog mode
      if (currentMode === 'blog') {
        updateBlogItemCount();
      }
    }
    
    function renderBlogPosts() {
      const postsContainer = document.getElementById('postsSection');
      postsContainer.innerHTML = '';
      
      if (blogPostsData.length === 0) {
        postsContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No blog posts found.</p>';
        return;
      }
      
      blogPostsData.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'blog-post';
        
        let postHTML = `<h2>${post.title}</h2>`;
        postHTML += `<div class="date">${post.date}</div>`;
        
        if (post.pictures) {
          postHTML += `<div style="margin: 20px 0;"><img src="${post.pictures}" alt="${post.title}" style="max-width: 600px; width: 100%; height: auto; padding-left:20px; padding-right:20px; border-radius: 0px;"></div>`;
        }
        
        if (post.text) {
          // Render the text as-is, allowing HTML tags including links
          postHTML += `<p>${post.text}</p>`;
        }
        
        if (post.link) {
          postHTML += `<p><a href="${post.link}" target="_blank" style="color: #0066cc; text-decoration: underline;">Read more →</a></p>`;
        }
        
        postDiv.innerHTML = postHTML;
        postsContainer.appendChild(postDiv);
      });
      
      // Update count if in blog mode
      if (currentMode === 'blog') {
        updateBlogItemCount();
      }
    }
    
    function switchMode() {
      currentMode = document.getElementById('modeSelector').value;
      
      if (currentMode === 'blog') {
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('blogContent').classList.add('active');
        document.getElementById('indexSelector').style.display = 'none';
        document.getElementById('blogSelector').style.display = 'block';
        document.getElementById('sortSelector').style.display = 'none';
        document.getElementById('rightSidebar').classList.remove('open');
        
        // Update item count based on current blog section
        updateBlogItemCount();
        
        if (blogPostsData.length === 0) {
          loadBlogPosts();
        }
      } else {
        document.getElementById('blogContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'grid';
        document.getElementById('indexSelector').style.display = 'block';
        document.getElementById('blogSelector').style.display = 'none';
        switchIndex();
      }
    }
    
    function switchBlogSection() {
      const section = document.getElementById('blogSelector').value;
      showBlogSection(section);
      updateBlogItemCount();
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
    
    function showBlogSection(section) {
      document.querySelectorAll('.blog-section').forEach(s => s.classList.remove('active'));
      
      // Update dropdown to match
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
      
      // Update item count
      if (currentMode === 'blog') {
        updateBlogItemCount();
      }
    }
    
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
    function formatArticleDate(dateStr) {
      if (!dateStr) return '';
      
      // Remove any timestamp portion (everything after space)
      let cleanDate = dateStr.split(' ')[0].trim();
      
      // Try to parse the date
      let date;
      
      // Handle various date formats
      if (cleanDate.includes('-')) {
        // YYYY-MM-DD format
        const parts = cleanDate.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          date = new Date(cleanDate);
        } else if (parts.length === 3) {
          // MM-DD-YYYY
          date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        }
      } else if (cleanDate.includes('/')) {
        // MM/DD/YYYY or YYYY/MM/DD
        const parts = cleanDate.split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY/MM/DD
            date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
          } else {
            // MM/DD/YYYY
            date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
          }
        }
      } else if (cleanDate.includes('.')) {
        // YYYY.MM.DD
        const parts = cleanDate.split('.');
        if (parts.length === 3) {
          date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        }
      }
      
      // If we still don't have a valid date, try parsing the original string
      if (!date || isNaN(date.getTime())) {
        date = new Date(dateStr);
      }
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return dateStr; // Return original if parsing failed
      }
      
      // Format as "Month Day, Year"
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    }
    function parseDate(dateStr) {
      if (!dateStr) return '';
      
      const original = dateStr;
      dateStr = dateStr.trim();
      
      console.log('Parsing date:', original);
      
      // Handle timestamp format (YYYY-MM-DD HH:MM:SS) FIRST
      if (dateStr.includes(' ')) {
        const result = dateStr.split(' ')[0];
        console.log('  -> Timestamp to:', result);
        return result;
      }
      
      // Handle text month formats: "September 19, 2024", "Nov. 3, 2020", "Aug. 25"
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
      
      // Check if it contains a text month
      const lowerDate = dateStr.toLowerCase();
      for (const [monthName, monthNum] of Object.entries(monthMap)) {
        if (lowerDate.includes(monthName)) {
          // Extract parts: "September 19, 2024" or "Nov. 3, 2020" or "Aug. 25"
          const parts = dateStr.replace(/[.,]/g, '').split(/\s+/);
          
          if (parts.length >= 3) {
            // Full format: Month Day, Year
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            const result = `${year}-${monthNum}-${day}`;
            console.log('  -> Text month (full) to:', result);
            return result;
          } else if (parts.length === 2) {
            // Month Day (assume current year 2025)
            const day = parts[1].padStart(2, '0');
            const result = `2025-${monthNum}-${day}`;
            console.log('  -> Text month (no year) to:', result);
            return result;
          }
        }
      }
      
      // Handle YYYY-MM-DD format (already correct)
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          console.log('  -> Already YYYY-MM-DD:', dateStr);
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
          const result = `${year}-${month}-${day}`;
          console.log('  -> YYYY.MM.DD to:', result);
          return result;
        }
      }
      
      // Handle YYYY/MM/DD or MM/DD/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY/MM/DD
            const result = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            console.log('  -> YYYY/MM/DD to:', result);
            return result;
          } else {
            // MM/DD/YYYY
            const result = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            console.log('  -> MM/DD/YYYY to:', result);
            return result;
          }
        }
      }
      
      // Just return year if only year is provided
      if (dateStr.length === 4 && !isNaN(dateStr)) {
        console.log('  -> Year only:', dateStr);
        return dateStr;
      }
      
      console.log('  -> Could not parse, returning as-is:', dateStr);
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
allData.articles = articlesData.map(row => {
  // Debug: log the first row to see what Papa Parse is giving us
  if (articlesData.indexOf(row) === 0) {
    console.log('First article row keys:', Object.keys(row));
    console.log('First article row data:', row);
  }
  
  return {
    src: row.src || row.Src || "",
    photo: row.photo || row.Photo || "",
    date: row.date || row.Date || "",
    sortDate: parseDate(row.datereal || row.Datereal || row.date || row.Date || ""),
    source: row.test || row.Test || "",
    type: "articles"
  };
}).filter(img => img.src);
        
        console.log('Processed articles count:', allData.articles.length);
        console.log('Sample articles with dates:', allData.articles.slice(0, 5).map(a => ({ 
          date: a.date, 
          sortDate: a.sortDate, 
          source: a.source 
        })));
        // Process Pictures
        allData.pictures = picturesData.map(row => ({
          src: row.Link || row.link || "",
          date: row.Date || row.date || "",
          sortDate: parseDate(row.Date || row.date || ""),
          photographer: row.Photographer || row.photographer || "",
          note: row.Note || row.note || "",
          type: "pictures"
        })).filter(img => img.src);
        
        // Process Photographers List - capture ALL columns dynamically
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
          .map(row => {
            // Capture ALL columns from the CSV
            const person = {
              firstName: (row['First Name'] || '').trim(),
              lastName: (row['Last Name'] || '').trim(),
              website: (row['Website'] || '').trim(),
              className: (row['Class'] || '').trim(),
              dateAdded: (row['Date Added'] || '').trim(),
              // Store all other columns for searchability
              allColumns: {}
            };
            
            // Add all columns to allColumns object for comprehensive search
            Object.keys(row).forEach(key => {
              person.allColumns[key] = (row[key] || '').trim();
            });
            
            return person;
          });
        
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
        document.getElementById('sortSelector').style.display = 'none';
        document.getElementById('rightSidebar').classList.remove('open');
        renderPhotographers();
        updateImageCount(photographersData.length);
      } else {
        // Show gallery view, hide photographers
        document.getElementById('photographersContent').classList.remove('active');
        document.getElementById('gallery').style.display = 'grid';
        document.getElementById('sortSelector').style.display = 'block';
        
        // Reset sort mode when switching indexes to ensure it applies
        document.getElementById('sortSelector').value = currentSortMode;
        
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
      const searchInput = document.getElementById('topSearchInput');
      const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
      
      // UNIVERSAL SEARCH MODE - Search across ALL data when there's a keyword
      if (keyword) {
        universalSearchMode = true;
        performUniversalSearch(keyword);
        return;
      }
      
      // Normal filtering mode - restore previous view
      universalSearchMode = false;
      
      // When search is cleared, restore the appropriate view
      if (currentIndex === 'photographers') {
        // Restore photographers view
        document.getElementById('photographersContent').classList.add('active');
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('blogContent')?.classList.remove('active');
        renderPhotographers();
        return;
      } else if (currentMode === 'blog') {
        // Restore blog view
        document.getElementById('blogContent').classList.add('active');
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('photographersContent').classList.remove('active');
        return;
      }
      
      // Otherwise restore gallery view
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('blogContent')?.classList.remove('active');
      document.getElementById('gallery').style.display = 'grid';
      
      const dateFrom = document.getElementById('dateFrom').value;
      const dateTo = document.getElementById('dateTo').value;
      
      let currentData = allData[currentIndex];
      
      filteredImages = currentData.filter(img => {
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
      
      // Apply sorting
      filteredImages = sortImages(filteredImages);
      
      renderImages(filteredImages);
      updateImageCount(filteredImages.length);
    }
    function ensureBlogDataLoaded() {
      // Check if blog functions exist and trigger loading if data isn't available
      if (typeof loadBlogPosts === 'function' && (typeof blogPostsData === 'undefined' || blogPostsData.length === 0)) {
        loadBlogPosts();
      }
      
      if (typeof loadInspoPosts === 'function' && (typeof inspoPostsData === 'undefined' || inspoPostsData.length === 0)) {
        loadInspoPosts();
      }
      
      if (typeof loadFieldNotes === 'function' && (typeof fieldNotesData === 'undefined' || fieldNotesData.length === 0)) {
        loadFieldNotes();
      }
    }
    function performUniversalSearch(query) {
      const results = [];
      
      // Load blog data if not already loaded
      ensureBlogDataLoaded();
      
      // Search Objects
      allData.objects.forEach(item => {
        const searchText = [
          item.title, item.date, item.medium, item.artist,
          item.location_card, item.location_overlay, item.keywords, item.note, item.source
        ].join(' ').toLowerCase();
        
        if (searchText.includes(query)) {
          results.push({ type: 'object', data: item });
        }
      });
      
      // Search Articles
      allData.articles.forEach(item => {
        const searchText = [item.date, item.source, item.src].join(' ').toLowerCase();
        if (searchText.includes(query)) {
          results.push({ type: 'article', data: item });
        }
      });
      
      // Search Pictures
      allData.pictures.forEach(item => {
        const searchText = [item.date, item.photographer, item.note].join(' ').toLowerCase();
        if (searchText.includes(query)) {
          results.push({ type: 'picture', data: item });
        }
      });
      
      // Search Photographers - NOW SEARCHES ALL COLUMNS
      photographersData.forEach(item => {
        // Build comprehensive search string from all columns
        const searchableFields = [
          item.firstName,
          item.lastName,
          item.website,
          item.className,
          item.dateAdded
        ];
        
        // Add all other columns from allColumns object
        if (item.allColumns) {
          Object.values(item.allColumns).forEach(value => {
            searchableFields.push(value);
          });
        }
        
        const searchText = searchableFields.join(' ').toLowerCase();
        
        if (searchText.includes(query)) {
          results.push({ type: 'photographer', data: item });
        }
      });
      
      // Search Blog Posts (if loaded)
      if (typeof blogPostsData !== 'undefined' && blogPostsData.length > 0) {
        blogPostsData.forEach(item => {
          const searchText = [item.title, item.date, item.text].join(' ').toLowerCase();
          if (searchText.includes(query)) {
            results.push({ type: 'blog-post', data: item });
          }
        });
      }
      
      // Search Inspo Posts (if loaded)
      if (typeof inspoPostsData !== 'undefined' && inspoPostsData.length > 0) {
        inspoPostsData.forEach(item => {
          const searchText = [item.name, item.date, item.text, item.link].join(' ').toLowerCase();
          if (searchText.includes(query)) {
            results.push({ type: 'inspo', data: item });
          }
        });
      }
      
      // Search Field Notes (if loaded)
      if (typeof fieldNotesData !== 'undefined' && fieldNotesData.length > 0) {
        fieldNotesData.forEach(item => {
          const searchText = [item.title, item.date, item.number].join(' ').toLowerCase();
          if (searchText.includes(query)) {
            results.push({ type: 'field-note', data: item });
          }
        });
      }
      
      console.log('Found', results.length, 'results');
      
      // Hide other content
      document.getElementById('photographersContent').classList.remove('active');
      document.getElementById('blogContent')?.classList.remove('active');
      document.getElementById('sortSelector').style.display = 'none';
      
      // Show gallery
      const gallery = document.getElementById('gallery');
      gallery.style.display = 'grid';
      gallery.className = '';
      gallery.innerHTML = '';
      
      updateImageCount(results.length);
      
      if (results.length === 0) {
        gallery.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; font-size: 18px;">No results found</div>';
        return;
      }
      
      // Render results
      results.forEach(result => {
        const card = createUniversalSearchCard(result);
        gallery.appendChild(card);
      });
    }
    function createUniversalSearchCard(result) {
      const card = document.createElement('div');
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
      
      // Source badge
      const badge = document.createElement('div');
      badge.style.cssText = 'font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;';
      badge.textContent = result.type.toUpperCase();
      card.appendChild(badge);
      
      // Render based on type
      if (result.type === 'object' || result.type === 'picture') {
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
            showOverlay(index);
          }
        };
      } else if (result.type === 'article') {
        if (result.data.photo) {
          const img = document.createElement('img');
          img.src = result.data.photo;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; font-size: 14px;';
        title.textContent = result.data.source || 'Article';
        card.appendChild(title);
        
        const date = document.createElement('div');
        date.style.cssText = 'font-size: 12px; color: #666;';
        date.textContent = formatArticleDate(result.data.date);
        card.appendChild(date);
        
        card.onclick = () => window.open(result.data.src, '_blank');
      } else if (result.type === 'photographer') {
        const name = document.createElement('div');
        name.style.cssText = 'font-weight: bold; font-size: 18px;';
        name.textContent = `${result.data.firstName} ${result.data.lastName}`;
        card.appendChild(name);
        
        card.onclick = () => window.open(result.data.website, '_blank');
      } else if (result.type === 'blog-post') {
        if (result.data.pictures) {
          const img = document.createElement('img');
          img.src = result.data.pictures;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; font-size: 14px;';
        title.textContent = result.data.title || 'Blog Post';
        card.appendChild(title);
        
        const date = document.createElement('div');
        date.style.cssText = 'font-size: 12px; color: #666;';
        date.textContent = result.data.date;
        card.appendChild(date);
        
        if (result.data.text) {
          const text = document.createElement('div');
          text.style.cssText = 'font-size: 12px; color: #333; margin-top: 4px;';
          text.textContent = result.data.text.substring(0, 100) + (result.data.text.length > 100 ? '...' : '');
          card.appendChild(text);
        }
        
        card.onclick = () => {
          if (result.data.link) {
            window.open(result.data.link, '_blank');
          }
        };
      } else if (result.type === 'inspo') {
        const name = document.createElement('div');
        name.style.cssText = 'font-weight: bold; font-size: 14px;';
        name.textContent = result.data.name || 'Inspo';
        card.appendChild(name);
        
        const date = document.createElement('div');
        date.style.cssText = 'font-size: 12px; color: #666;';
        date.textContent = result.data.date;
        card.appendChild(date);
        
        if (result.data.text) {
          const text = document.createElement('div');
          text.style.cssText = 'font-size: 12px; color: #333; margin-top: 4px;';
          text.textContent = result.data.text.substring(0, 80) + (result.data.text.length > 80 ? '...' : '');
          card.appendChild(text);
        }
        
        card.onclick = () => {
          if (result.data.link) {
            window.open(result.data.link, '_blank');
          }
        };
      } else if (result.type === 'field-note') {
        if (result.data.image) {
          const img = document.createElement('img');
          img.src = result.data.image;
          img.style.cssText = 'width: 100%; height: 120px; object-fit: cover; margin-bottom: 8px;';
          card.appendChild(img);
        }
        
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; font-size: 14px;';
        const titleText = result.data.number ? `${result.data.number} - ${result.data.title}` : result.data.title;
        title.textContent = titleText || 'Field Note';
        card.appendChild(title);
        
        const date = document.createElement('div');
        date.style.cssText = 'font-size: 12px; color: #666;';
        date.textContent = result.data.date;
        card.appendChild(date);
        
        card.onclick = () => {
          if (result.data.url) {
            window.open(result.data.url, '_blank');
          }
        };
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
    function clearFilters() {
      document.getElementById('topSearchInput').value = '';
      document.getElementById('dateFrom').value = '';
      document.getElementById('dateTo').value = '';
      document.querySelectorAll('.checkbox-group input').forEach(cb => cb.checked = true);
      document.getElementById('sortSelector').value = 'date-desc';
      currentSortMode = 'date-desc';
      universalSearchMode = false;
      applyFilters();
    }
    function updateImageCount(count) {
      document.getElementById('imageCount').textContent = `${count} ${universalSearchMode ? 'results' : 'items'}`;
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
            <div class="article-date">${formatArticleDate(img.date)}</div>
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
      
      // Filter photographers by search term - SEARCH ALL COLUMNS
      filteredPhotographers = photographersData.filter(p => {
        // Build comprehensive search string from all known fields
        const searchableFields = [
          p.firstName,
          p.lastName,
          p.website,
          p.className,
          p.dateAdded
        ];
        
        // Add all other columns from allColumns object
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
