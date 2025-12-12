// Keyboard shortcuts handler
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }
  
// Handle Escape key first
if (e.key === 'Escape') {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation(); // ADD THIS LINE
  
  const fullscreen = document.getElementById('stickerFullscreen');
  const modal = document.getElementById('keyboardShortcutsModal');
  
  if (fullscreen && fullscreen.classList.contains('active')) {
    fullscreen.classList.remove('active');
    document.body.style.overflow = '';
    return false; // ADD THIS
  }
  
  if (modal) {
    modal.remove();
    return false; // ADD THIS
  }
  
  return false; // ADD THIS
}
  
  switch(e.key.toLowerCase()) {
    case '/':
      e.preventDefault();
      document.getElementById('searchBox').focus();
      break;
      
    case 'h':
      e.preventDefault();
      goToAllPosts();
      break;
      
    case '2':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection1"]').click();
      break;
      
    case '1':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection2"]').click();
      break;
      
    case '3':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="collection4"]').click();
      break;
      
    case '4':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="objects"]').click();
      break;
      
    case '6':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="photos"]').click();
      break;
      
    case '5':
    case 's':
      e.preventDefault();
      document.querySelector('.nav-item[data-filter="saved"]').click();
      break;
      
    case 'a':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="articles-index"]').click();
      break;
      
    case 'p':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="photographers-index"]').click();
      break;
      
    case 'i':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="stickers-index"]').click();
      break;
      
    case 'o':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="objects-index"]').click();
      break;
      
    case 't':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="photos-index"]').click();
      break;
      
    case 'r':
      e.preventDefault();
      if (currentView === 'photographers-index') {
        randomPhotographer();
      }
      break;
      
    case 'x':
      e.preventDefault();
      document.querySelector('.sort-btn[data-sort="shuffle"]').click();
      break;
      
    case 'f':
      if (currentView.includes('-index')) {
        e.preventDefault();
        toggleFullscreen();
      }
      break;
      
    case '?':
      e.preventDefault();
      showKeyboardShortcuts();
      break;
  }
});

// Keyboard shortcuts modal
function showKeyboardShortcuts() {
  const existing = document.getElementById('keyboardShortcutsModal');
  if (existing) {
    existing.remove();
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'keyboardShortcutsModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 32px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Keyboard Shortcuts</h2>
        <button onclick="closeKeyboardShortcuts()" style="background: transparent; border: none; font-size: 24px; cursor: pointer; color: #7c7c7c; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      
      <div style="display: grid; gap: 20px;">
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Navigation</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to All Posts</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">H</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Articles</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">1</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Field Notes</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">2</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Stickers</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">3</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Objects</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">4</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Photos</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">6</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Saved</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">5</kbd> or <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">S</kbd>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Indexes</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Articles Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">A</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Photographers Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">P</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Stickers Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">I</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Objects Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">O</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Photos Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">T</kbd>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #7c7c7c; margin-bottom: 12px;">Actions</h3>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Search</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">/</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Shuffle Posts</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">X</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Random Photographer</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">R</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Toggle Fullscreen (Index pages)</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">F</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Close Modal</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">Esc</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span>Show This Help</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">?</kbd>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #edeff1; text-align: center; color: #7c7c7c; font-size: 14px;">
        Press <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">?</kbd> anytime to toggle this help
      </div>
    </div>
  `;
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeKeyboardShortcuts();
    }
  };
  
  document.body.appendChild(modal);
}

function closeKeyboardShortcuts() {
  const modal = document.getElementById('keyboardShortcutsModal');
  if (modal) {
    modal.remove();
  }
}

// Fullscreen toggle functions
function toggleFullscreen() {
  document.body.classList.toggle('fullscreen-mode');
  const icon = document.getElementById('fullscreenIcon');
  const isFullscreen = document.body.classList.contains('fullscreen-mode');
  
  if (isFullscreen) {
    icon.setAttribute('data-lucide', 'minimize-2');
  } else {
    icon.setAttribute('data-lucide', 'maximize-2');
  }
  
  lucide.createIcons();
}

function showFullscreenToggle() {
  document.getElementById('fullscreenToggle').classList.add('visible');
}

function hideFullscreenToggle() {
  document.getElementById('fullscreenToggle').classList.remove('visible');
  document.body.classList.remove('fullscreen-mode');
  const icon = document.getElementById('fullscreenIcon');
  icon.setAttribute('data-lucide', 'maximize-2');
  lucide.createIcons();
}

// Initialize application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllData);
} else {
  loadAllData();
}

// Mobile menu close on outside click
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.left-sidebar');
  const menuButton = document.querySelector('.mobile-menu-toggle');
  
  if (sidebar && menuButton && 
      sidebar.classList.contains('mobile-open') && 
      !sidebar.contains(e.target) && 
      !menuButton.contains(e.target)) {
    toggleMobileMenu();
  }
});
