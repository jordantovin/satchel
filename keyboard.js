// ============================================================================
// AMERICANISMS GALLERY - KEYBOARD SHORTCUTS
// ============================================================================

(function() {
  'use strict';

  function initKeyboardShortcuts() {
    createKeyboardHelpOverlay();
    addKeyboardShortcutIndicator();
    document.addEventListener('keydown', handleKeyboardShortcuts);
    console.log('Keyboard shortcuts initialized');
  }

  window.showKeyboardHelp = function() {
    const helpOverlay = document.getElementById('keyboardHelpOverlay');
    if (helpOverlay) {
      helpOverlay.style.display = 'flex';
    }
  };

  window.hideKeyboardHelp = function() {
    const helpOverlay = document.getElementById('keyboardHelpOverlay');
    if (helpOverlay) {
      helpOverlay.style.display = 'none';
    }
  };

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
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">s</kbd>
          <span>Cycle sort mode</span>
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
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.hideKeyboardHelp();
      }
    });
  }

  function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
        return;
      }
      return;
    }
    
    // Check if overlay is open
    const overlayOpen = document.getElementById("overlay")?.style.display === "flex";
    const helpOpen = document.getElementById('keyboardHelpOverlay')?.style.display === 'flex';
    
    // Overlay is already handled in main script, so skip if open
    if (overlayOpen) return;
    
    // Handle help overlay
    if (helpOpen && e.key === 'Escape') {
      e.preventDefault();
      window.hideKeyboardHelp();
      return;
    }
    
    // General shortcuts
    switch(e.key) {
      case '?':
        e.preventDefault();
        window.showKeyboardHelp();
        break;
        
      case 'Escape':
        e.preventDefault();
        if (helpOpen) {
          window.hideKeyboardHelp();
        }
        break;
        
      case '/':
        e.preventDefault();
        const searchInput = document.getElementById('topSearchInput');
        if (searchInput) searchInput.focus();
        break;
        
      case '1':
        e.preventDefault();
        const selector = document.getElementById('indexSelector');
        if (selector && selector.style.display !== 'none') {
          selector.value = 'objects';
          if (typeof window.switchIndex === 'function') window.switchIndex();
        }
        break;
        
      case '2':
        e.preventDefault();
        const selector2 = document.getElementById('indexSelector');
        if (selector2 && selector2.style.display !== 'none') {
          selector2.value = 'articles';
          if (typeof window.switchIndex === 'function') window.switchIndex();
        }
        break;
        
      case '3':
        e.preventDefault();
        const selector3 = document.getElementById('indexSelector');
        if (selector3 && selector3.style.display !== 'none') {
          selector3.value = 'pictures';
          if (typeof window.switchIndex === 'function') window.switchIndex();
        }
        break;
        
      case '4':
        e.preventDefault();
        const selector4 = document.getElementById('indexSelector');
        if (selector4 && selector4.style.display !== 'none') {
          selector4.value = 'photographers';
          if (typeof window.switchIndex === 'function') window.switchIndex();
        }
        break;
        
      case 'b':
      case 'B':
        e.preventDefault();
        const modeSelector = document.getElementById('modeSelector');
        if (modeSelector) {
          const currentModeValue = modeSelector.value;
          modeSelector.value = currentModeValue === 'blog' ? 'archive' : 'blog';
          if (typeof window.switchMode === 'function') window.switchMode();
        }
        break;
        
      case 'c':
      case 'C':
        e.preventDefault();
        if (typeof window.clearFilters === 'function') {
          window.clearFilters();
        }
        break;
        
      case 's':
      case 'S':
        e.preventDefault();
        if (typeof window.cycleSortMode === 'function') {
          window.cycleSortMode();
        }
        break;
        
      case 'r':
      case 'R':
        e.preventDefault();
        const randomBtn = document.getElementById('randomPhotographer');
        if (randomBtn && randomBtn.offsetParent !== null) {
          randomBtn.click();
        }
        break;
    }
  }

  function addKeyboardShortcutIndicator() {
    const rightNav = document.querySelector('.right-nav');
    if (rightNav && !document.getElementById('keyboardShortcutsBtn')) {
      const indicator = document.createElement('button');
      indicator.id = 'keyboardShortcutsBtn';
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
      indicator.addEventListener('click', window.showKeyboardHelp);
      rightNav.appendChild(indicator);
    }
  }

  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
  } else {
    initKeyboardShortcuts();
  }

})();
