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
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">/</kbd>
          <span>Focus search</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">s</kbd>
          <span>Cycle sort mode</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">c</kbd>
          <span>Clear all filters</span>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; margin-bottom: 12px; color: #666;">Navigation</h3>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 14px;">
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">1 / b</kbd>
          <span>Blog</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">2 / i</kbd>
          <span>Inspo</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">3 / f</kbd>
          <span>Field Notes</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">4 / o</kbd>
          <span>Objects</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">5 / a</kbd>
          <span>Articles</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">6 / p</kbd>
          <span>Pictures</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">7</kbd>
          <span>Places</span>
          
          <kbd style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">8 / l / n</kbd>
          <span>Names</span>
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
        </div>
      </div>
      
      <button onclick="hideKeyboardHelp()" style="margin-top: 24px; padding: 12px 24px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;">
        Close
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
    
    // Allow all browser shortcuts (Ctrl, Cmd, Alt combinations)
    if (e.ctrlKey || e.metaKey || e.altKey) {
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
        
      // Navigation shortcuts - matching menu order
      case '1':
      case 'b':
      case 'B':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('blog', 'posts');
        }
        break;
        
      case '2':
      case 'i':
      case 'I':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('blog', 'inspo');
        }
        break;
        
      case '3':
      case 'f':
      case 'F':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('blog', 'fieldNotes');
        }
        break;
        
      case '4':
      case 'o':
      case 'O':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('archive', 'objects');
        }
        break;
        
      case '5':
      case 'a':
      case 'A':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('archive', 'articles');
        }
        break;
        
      case '6':
      case 'p':
      case 'P':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('archive', 'pictures');
        }
        break;
        
      case '7':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('archive', 'places');
        }
        break;
        
      case '8':
      case 'l':
      case 'L':
      case 'n':
      case 'N':
        e.preventDefault();
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('archive', 'photographers');
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
