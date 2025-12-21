// Sort button functionality
let currentSortMode = 'NEWEST'; // 'NEWEST', 'OLDEST', 'alphabetical'
function cycleSortMode() {
  // Skip if in photographers view or blog mode
  if (typeof currentIndex !== 'undefined' && currentIndex === 'photographers') return;
  if (typeof currentMode !== 'undefined' && currentMode === 'blog') return;
  
  const modes = ['NEWEST', 'OLDEST', 'alphabetical'];
  const currentIdx = modes.indexOf(currentSortMode);
  currentSortMode = modes[(currentIdx + 1) % modes.length];
  
  // Update button text with shorter labels
  const sortBtn = document.getElementById('sortButton');
  if (sortBtn) {
    const labels = {
      'NEWEST': 'NEWEST',
      'OLDEST': 'OLDEST',
      'alphabetical': 'A-Z'
    };
    sortBtn.textContent = labels[currentSortMode];
  }
  
  // Re-apply filters to trigger re-render with new sort
  if (typeof applyFilters === 'function') {
    applyFilters();
  }
}
function sortFilteredImages(images) {
  const sorted = [...images];
  
  if (currentSortMode === 'NEWEST') {
    sorted.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  } else if (currentSortMode === 'OLDEST') {
    sorted.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  } else if (currentSortMode === 'alphabetical') {
    // Sort alphabetically based on type
    sorted.sort((a, b) => {
      let aKey = '';
      let bKey = '';
      
      if (typeof currentIndex !== 'undefined') {
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
      }
      
      return aKey.localeCompare(bKey);
    });
  }
  
  return sorted;
}
// Show/hide sort button based on view
function updateSortButtonVisibility() {
  const sortBtn = document.getElementById('sortButton');
  if (!sortBtn) return;
  
  // Hide in photographers view
  if (typeof currentIndex !== 'undefined' && currentIndex === 'photographers') {
    sortBtn.style.display = 'none';
    return;
  }
  
  // Hide in blog mode
  if (typeof currentMode !== 'undefined' && currentMode === 'blog') {
    sortBtn.style.display = 'none';
    return;
  }
  
  // Show for objects, articles, and pictures
  sortBtn.style.display = 'flex';
}
// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateSortButtonVisibility();
});
