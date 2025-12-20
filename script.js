const americanismsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-tRe4QAkAIideMvvWDNWq2Aj_Nx6m4QG9snhFkpqqOGX8gU09X6uUQdkfuOj9yLIybn0iPIFoZbK-/pub?output=csv';
const objectsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv';
const articlesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTo8ua4UreD9MUP4CI6OOXkt8LeagGX9w85veJfgi9DKJnHc2-dbCMvq5cx8DtlUO0YcV5RMPzcJ_KG/pub?output=csv';
const picturesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5j1OVFnwB19xVA3ZVM46C8tNKvGHimyElwIAgMFDzurSEFA0m_8iHBIvD1_TKbtlfWw2MaDAirm47/pub?output=csv';
const photographersListURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UTNOg8d2LIrCU8A9ebfkYOMV2V3E7egroQgliVc4v6mp7Xi9fdmPaxN3k3YUmeW123C8UvwdiNmy/pub?output=csv';

const blogPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThaJ-Q5u7zUSy9DA5oMCUkajzPdkWpECZzQf7SYpi8SvSCqvRgzlQvAUI6xAtaumQEnsaHSbYLkHt_/pub?output=csv';
const inspoPostsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtF8T2xKCyuDXq1_hyxL0Do2g8wfQ5AtrA-SlKSoUa5TlyuaKgekwK4j4ezU1z8dVjf5P8YYVnoXT9/pub?output=csv';
const fieldNotesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv';

let allData = {
  objects: [],
  articles: [],
  pictures: []
};
let photographersData = [];
let filteredPhotographers = [];
let blogPostsData = [];
let inspoPostsData = [];
let fieldNotesData = [];
let currentView = 'posts'; // posts, inspo, fieldNotes, objects, pictures, articles, library
let filteredImages = [];
let currentImageIndex = -1;
let universalSearchMode = false;

// Navigation button handlers
document.getElementById('btnPosts').addEventListener('click', () => switchView('posts'));
document.getElementById('btnInspo').addEventListener('click', () => switchView('inspo'));
document.getElementById('btnFieldNotes').addEventListener('click', () => switchView('fieldNotes'));
document.getElementById('btnObjects').addEventListener('click', () => switchView('objects'));
document.getElementById('btnPictures').addEventListener('click', () => switchView('pictures'));
document.getElementById('btnArticles').addEventListener('click', () => switchView('articles'));
document.getElementById('btnLibrary').addEventListener('click', () => switchView('library'));

function switchView(view) {
  currentView = view;
  
  // Update active button
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = {
    'posts': 'btnPosts',
    'inspo': 'btnInspo',
    'fieldNotes': 'btnFieldNotes',
    'objects': 'btnObjects',
    'pictures': 'btnPictures',
    'articles': 'btnArticles',
    'library': 'btnLibrary'
  }[view];
  document.getElementById(activeBtn).classList.add('active');
  
  // Hide all sections
  document.getElementById('gallery').style.display = 'none';
  document.getElementById('photographersContent').classList.remove('active');
  document.getElementById('blogContent').classList.remove('active');
  document.querySelectorAll('.blog-section').forEach(s => s.classList.remove('active'));
  
  // Show appropriate section
  if (view === 'posts' || view === 'inspo' || view === 'fieldNotes') {
    document.getElementById('blogContent').classList.add('active');
    document.getElementById(view + 'Section').classList.add('active');
    
    // Load data if needed
    if (view === 'posts' && blogPostsData.length === 0) loadBlogPosts();
    if (view === 'inspo' && inspoPostsData.length === 0) loadInspoPosts();
    if (view === 'fieldNotes' && fieldNotesData.length === 0) loadFieldNotes();
    
    updateBlogItemCount(view);
  } else if (view === 'library') {
    document.getElementById('photographersContent').classList.add('active');
    renderPhotographers();
    updateImageCount(photographersData.length);
  } else {
    // objects, pictures, articles
    document.getElementById('gallery').style.display = 'grid';
    updateFilterVisibility(view);
    applyFilters();
  }
}

function updateBlogItemCount(view) {
  let count = 0;
  if (view === 'posts') count = blogPostsData.length;
  else if (view === 'inspo') count = inspoPostsData.length;
  else if (view === 'fieldNotes') count = fieldNotesData.length;
  
  document.getElementById('imageCount').textContent = `${count} items`;
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

function renderInspoPosts() {
  const inspoContainer = document.getElementById('inspoSection');
  inspoContainer.innerHTML = '';
  
  if (inspoPostsData.length === 0) {
    inspoContainer.innerHTML = '<p style="font-size: 16px; color: #666;">No inspo posts found.</p>';
    return;
  }
  
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
  
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
    const [monthA, yearA] = a.split(', ');
    const [monthB, yearB] = b.split(', ');
    if (yearB !== yearA) return yearB - yearA;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
  });
  
  sortedMonths.forEach(monthYear => {
    const monthDiv = document.createElement('div');
    monthDiv.style.marginBottom = '40px';
    
    const monthHeader = document.createElement('h2');
    monthHeader.textContent = monthYear;
    monthHeader.style.fontSize = '28px';
    monthHeader.style.fontWeight = 'bold';
    monthHeader.style.fontFamily = 'Helvetica';
    monthHeader.style.marginBottom = '15px';
    monthDiv.appendChild(monthHeader);
    
    const sortedPosts = groupedByMonth[monthYear].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
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
  
  if (currentView === 'inspo') {
    updateBlogItemCount('inspo');
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
  
  if (currentView === 'fieldNotes') {
    updateBlogItemCount('fieldNotes');
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
      postHTML += `<p>${post.text}</p>`;
    }
    
    if (post.link) {
      postHTML += `<p><a href="${post.link}" target="_blank" style="color: #0066cc; text-decoration: underline;">Read more →</a></p>`;
    }
    
    postDiv.innerHTML = postHTML;
    postsContainer.appendChild(postDiv);
  });
  
  if (currentView === 'posts') {
    updateBlogItemCount('posts');
  }
}

function formatArticleDate(dateStr) {
  if (!dateStr) return '';
  
  let cleanDate = dateStr.split(' ')[0].trim();
  
  let date;
  
  if (cleanDate.includes('-')) {
    const parts = cleanDate.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      date = new Date(cleanDate);
    } else if (parts.length === 3) {
      date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    }
  } else if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
      }
    }
  } else if (cleanDate.includes('.')) {
    const parts = cleanDate.split('.');
    if (parts.length === 3) {
      date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    }
  }
  
  if (!date || isNaN(date.getTime())) {
    date = new Date(dateStr);
  }
  
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

function parseDate(dateStr) {
  if (!dateStr) return '';
  
  const original = dateStr;
  dateStr = dateStr.trim();
  
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[0];
  }
  
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
  
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return dateStr;
    }
  }
  
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
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

    allData.articles = articlesData.map(row => ({
      src: row.src || row.Src || "",
      photo: row.photo || row.Photo || "",
      date: row.date || row.Date || "",
      sortDate: parseDate(row.datereal || row.Datereal || row.date || row.Date || ""),
      source: row.test || row.Test || "",
      type: "articles"
    })).filter(img => img.src);

    allData.pictures = picturesData.map(row => ({
      src: row.Link || row.link || "",
      date: row.Date || row.date || "",
      sortDate: parseDate(row.Date || row.date || ""),
      photographer: row.Photographer || row.photographer || "",
      note: row.Note || row.note || "",
      type: "pictures"
    })).filter(img => img.src);
    
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
    
    const allPhotographers = allPeople.filter(person => {
      const classLower = person.className.toLowerCase();
      return classLower.includes('photographer');
    });
    
    photographersData = allPhotographers.filter(person => person.website !== '');
    photographersData.sort((a, b) => a.lastName.localeCompare(b.lastName));

    Object.keys(allData).forEach(key => {
      allData[key].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    });

    switchView(currentView);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function updateFilterVisibility(view) {
  document.getElementById('mediumFilter').style.display = 'none';
  document.getElementById('photographerFilter').style.display = 'none';
  document.getElementById('sourceFilter').style.display = 'none';

  if (view === 'objects') {
    document.getElementById('mediumFilter').style.display = 'block';
    document.getElementById('sourceFilter').style.display = 'block';
    createMediumCheckboxes();
    createObjectSourceCheckboxes();
  } else if (view === 'pictures') {
    document.getElementById('photographerFilter').style.display = 'block';
    createPhotographerCheckboxes();
  } else if (view === 'articles') {
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
    universalSearchMode = true;
    performUniversalSearch(keyword);
    return;
  }
  
  universalSearchMode = false;
  
  if (currentView === 'library') {
    document.getElementById('photographersContent').classList.add('active');
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('blogContent').classList.remove('active');
    renderPhotographers();
    return;
  } else if (currentView === 'posts' || currentView === 'inspo' || currentView === 'fieldNotes') {
    document.getElementById('blogContent').classList.add('active');
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('photographersContent').classList.remove('active');
    return;
  }
  
  document.getElementById('photographersContent').classList.remove('active');
  document.getElementById('blogContent').classList.remove('active');
  document.getElementById('gallery').style.display = 'grid';
  
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  
  let currentData = allData[currentView];
  
  filteredImages = currentData.filter(img => {
    if (dateFrom && img.sortDate < dateFrom) return false;
    if (dateTo && img.sortDate > dateTo) return false;

    if (currentView === 'objects') {
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
    } else if (currentView === 'pictures') {
      const selectedPhotographers = Array.from(document.querySelectorAll('#photographerCheckboxes input:checked'))
        .map(cb => cb.value);
      if (selectedPhotographers.length > 0 && img.photographer && !selectedPhotographers.includes(img.photographer)) {
        return false;
      }
    } else if (currentView === 'articles') {
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

function ensureBlogDataLoaded() {
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
  
  ensureBlogDataLoaded();
  
  allData.objects.forEach(item => {
    const searchText = [
      item.title, item.date, item.medium, item.artist,
      item.location_card, item.location_overlay, item.keywords, item.note, item.source
    ].join(' ').toLowerCase();
    
    if (searchText.includes(query)) {
      results.push({ type: 'object', data: item });
    }
  });
  
  allData.articles.forEach(item => {
    const searchText = [item.date, item.source, item.src].join(' ').toLowerCase();
    if (searchText.includes(query)) {
      results.push({ type: 'article', data: item });
    }
  });
  
  allData.pictures.forEach(item => {
    const searchText = [item.date, item.photographer, item.note].join(' ').toLowerCase();
    if (searchText.includes(query)) {
      results.push({ type: 'picture', data: item });
    }
  });
  
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
    
    if (searchText.includes(query)) {
      results.push({ type: 'photographer', data: item });
    }
  });
  
  if (typeof blogPostsData !== 'undefined' && blogPostsData.length > 0) {
    blogPostsData.forEach(item => {
      const searchText = [item.title, item.date, item.text].join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: 'blog-post', data: item });
      }
    });
  }
  
  if (typeof inspoPostsData !== 'undefined' && inspoPostsData.length > 0) {
    inspoPostsData.forEach(item => {
      const searchText = [item.name, item.date, item.text, item.link].join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: 'inspo', data: item });
      }
    });
  }
  
  if (typeof fieldNotesData !== 'undefined' && fieldNotesData.length > 0) {
    fieldNotesData.forEach(item => {
      const searchText = [item.title, item.date, item.number].join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: 'field-note', data: item });
      }
    });
  }
  
  console.log('Found', results.length, 'results');
  
  document.getElementById('photographersContent').classList.remove('active');
  document.getElementById('blogContent').classList.remove('active');
  
  const gallery = document.getElementById('gallery');
  gallery.style.display = 'grid';
  gallery.className = '';
  gallery.innerHTML = '';
  
  updateImageCount(results.length);
  
  if (results.length === 0) {
    gallery.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; font-size: 18px;">No results found</div>';
    return;
  }
  
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
  
  const badge = document.createElement('div');
  badge.style.cssText = 'font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;';
  badge.textContent = result.type.toUpperCase();
  card.appendChild(badge);
  
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
  universalSearchMode = false;
  applyFilters();
}

function updateImageCount(count) {
  document.getElementById('imageCount').textContent = `${count} ${universalSearchMode ? 'results' : 'items'}`;
}

function renderImages(imageArray) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  
  gallery.className = '';
  if (currentView === 'objects') {
    gallery.classList.add('objects-view');
  } else if (currentView === 'articles') {
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

document.getElementById('photographersSearch').addEventListener('input', renderPhotographers);

document.getElementById('allPhotographers').addEventListener('click', function() {
  document.getElementById('photographersSearch').value = '';
  this.classList.add('active');
  document.getElementById('randomPhotographer').classList.remove('active');
  renderPhotographers();
});

document.getElementById('randomPhotographer').addEventListener('click', function() {
  if (photographersData.length > 0) {
    const randomPhotographer = photographersData[Math.floor(Math.random() * photographersData.length)];
    window.open(randomPhotographer.website, '_blank');
  }
  this.classList.add('active');
  document.getElementById('allPhotographers').classList.remove('active');
});

loadAllData();
