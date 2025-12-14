// Keyboard shortcuts functionality

// Show keyboard shortcuts help overlay
function showKeyboardHelp() {
  const helpOverlay = document.getElementById('keyboardHelpOverlay');
  if (helpOverlay) {
    helpOverlay.style.display = 'flex';
  }
}

function hideKeyboardHelp() {
  const helpOverlay = document.getElementById('keyboardHelpOverlay');
  if (helpOverlay) {
    helpOverlay.style.display = 'none';
  }
}

// Create keyboard help overlay
function createKeyboardHelpOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'keyboardHelpOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  const helpBox = document.createElement('div');
  helpBox.style.cssText = `
    background: white;
    padding: 40px;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  helpBox.innerHTML = `
    <h2 style="margin-top: 0; font-size: 28px;">Keyboard Shortcuts</h2>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 12px; color: #666;">General</h3>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 14px;">
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">?</kbd>
        <span>Show this help</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Escape</kbd>
        <span>Close overlay/help</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">/</kbd>
        <span>Focus search</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">r</kbd>
        <span>Random photographer</span>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 12px; color: #666;">Navigation</h3>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 14px;">
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">1</kbd>
        <span>Switch to Objects</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">2</kbd>
        <span>Switch to Articles</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">3</kbd>
        <span>Switch to Pictures</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">4</kbd>
        <span>Switch to Photographers</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">b</kbd>
        <span>Toggle Blog mode</span>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 12px; color: #666;">Image Overlay</h3>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 14px;">
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">←</kbd>
        <span>Previous image</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">→</kbd>
        <span>Next image</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">f</kbd>
        <span>Toggle fullscreen</span>
        
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Escape</kbd>
        <span>Close overlay</span>
      </div>
    </div>
    
    <div>
      <h3 style="font-size: 18px; margin-bottom: 12px; color: #666;">Filters</h3>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 14px;">
        <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">c</kbd>
        <span>Clear all filters</span>
      </div>
    </div>
    
    <button onclick="hideKeyboardHelp()" style="margin-top: 24px; padding: 12px 24px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;">
      Close (Escape)
    </button>
  `;
  
  overlay.appendChild(helpBox);
  document.body.appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideKeyboardHelp();
    }
  });
}

// Main keyboard event handler
function handleKeyboardShortcuts(e) {
  // Don't trigger shortcuts when typing in input fields
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    // Exception: Escape key should work even in input fields
    if (e.key === 'Escape') {
      e.target.blur();
      return;
    }
    return;
  }
  
  // Check if overlay is open
  const overlayOpen = document.getElementById("overlay").style.display === "flex";
  const helpOpen = document.getElementById('keyboardHelpOverlay')?.style.display === 'flex';
  
  // Handle overlay-specific shortcuts first
  if (overlayOpen) {
    if (e.key === "ArrowLeft" && currentImageIndex > 0) {
      e.preventDefault();
      showOverlay(currentImageIndex - 1);
    } else if (e.key === "ArrowRight" && currentImageIndex < filteredImages.length - 1) {
      e.preventDefault();
      showOverlay(currentImageIndex + 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideOverlay();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFullscreen();
    }
    return;
  }
  
  // Handle help overlay
  if (helpOpen && e.key === 'Escape') {
    e.preventDefault();
    hideKeyboardHelp();
    return;
  }
  
  // General shortcuts
  switch(e.key) {
    case '?':
      e.preventDefault();
      showKeyboardHelp();
      break;
      
    case 'Escape':
      e.preventDefault();
      if (helpOpen) {
        hideKeyboardHelp();
      }
      break;
      
    case '/':
      e.preventDefault();
      document.getElementById('topSearchInput').focus();
      break;
      
    case '1':
      e.preventDefault();
      if (currentMode === 'archive') {
        document.getElementById('indexSelector').value = 'objects';
        switchIndex();
      }
      break;
      
    case '2':
      e.preventDefault();
      if (currentMode === 'archive') {
        document.getElementById('indexSelector').value = 'articles';
        switchIndex();
      }
      break;
      
    case '3':
      e.preventDefault();
      if (currentMode === 'archive') {
        document.getElementById('indexSelector').value = 'pictures';
        switchIndex();
      }
      break;
      
    case '4':
      e.preventDefault();
      if (currentMode === 'archive') {
        document.getElementById('indexSelector').value = 'photographers';
        switchIndex();
      }
      break;
      
    case 'b':
    case 'B':
      e.preventDefault();
      const currentModeValue = document.getElementById('modeSelector').value;
      document.getElementById('modeSelector').value = currentModeValue === 'blog' ? 'archive' : 'blog';
      switchMode();
      break;
      
    case 'c':
    case 'C':
      e.preventDefault();
      if (currentMode === 'archive' && currentIndex !== 'photographers') {
        clearFilters();
      }
      break;
      
    case 'r':
    case 'R':
      e.preventDefault();
      if (currentIndex === 'photographers' && photographersData.length > 0) {
        const randomPhotographer = photographersData[Math.floor(Math.random() * photographersData.length)];
        window.open(randomPhotographer.website, '_blank');
      }
      break;
  }
}

// Add keyboard shortcut indicator to the nav
function addKeyboardShortcutIndicator() {
  const rightNav = document.querySelector('.right-nav');
  if (rightNav) {
    const indicator = document.createElement('button');
    indicator.innerHTML = '?';
    indicator.title = 'Keyboard shortcuts';
    indicator.style.cssText = `
      padding: 8px 12px;
      font-size: 18px;
      font-weight: bold;
      border: 1px solid #000;
      background: white;
      color: #000;
      cursor: pointer;
      border-radius: 0;
      transition: background-color 0.2s;
    `;
    indicator.addEventListener('mouseenter', () => {
      indicator.style.backgroundColor = '#f5f5f5';
    });
    indicator.addEventListener('mouseleave', () => {
      indicator.style.backgroundColor = 'white';
    });
    indicator.addEventListener('click', showKeyboardHelp);
    rightNav.appendChild(indicator);
  }
}

// Initialize keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
  createKeyboardHelpOverlay();
  addKeyboardShortcutIndicator();
  document.addEventListener('keydown', handleKeyboardShortcuts);
});
