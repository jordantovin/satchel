// Filter management

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
