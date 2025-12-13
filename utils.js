// Utility functions

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

async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function toggleSearch() {
  const searchInput = document.getElementById('topSearchInput');
  searchInput.classList.toggle('active');
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
  }
}

function updateImageCount(count) {
  document.getElementById('imageCount').textContent = `${count} items`;
}
