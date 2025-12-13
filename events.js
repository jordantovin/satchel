// Event handlers and initialization

function initializeEventListeners() {
  // Search functionality
  document.getElementById('topSearchInput').addEventListener('input', applyFilters);
  
  // Overlay events
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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  loadAllData();
});
