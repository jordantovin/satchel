function render() {
  if (currentView === "photographers-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderPhotographersIndex();
    return;
  }
  
  if (currentView === "stickers-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderStickersIndex();
    return;
  }
  
  if (currentView === "articles-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderArticlesIndex();
    return;
  }
  
  if (currentView === "objects-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderObjectsIndex();
    return;
  }
  
  if (currentView === "photos-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderPhotosIndex();
    return;
  }
  
  if (currentView === "pictures-index") {
    document.querySelector('.sort-bar').style.display = 'none';
    document.getElementById('endOfFeed').style.display = 'none';
    renderPicturesIndex();
    return;
  }
  
  hideFullscreenToggle();
  
  document.querySelector('.sort-bar').style.display = 'flex';
  
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  const filtered = filterPosts(allPosts);
  const sorted = sortPosts(filtered);
  const visible = sorted.slice(0, displayLimit);
  
  if (searchQuery) {
    const searchInfo = document.createElement("div");
    searchInfo.style.cssText = "background: #f6f7f8; padding: 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #7c7c7c;";
    searchInfo.innerHTML = `<strong>${filtered.length}</strong> result${filtered.length !== 1 ? 's' : ''} for "<strong>${searchQuery}</strong>"`;
    feed.appendChild(searchInfo);
  }
  
  if (visible.length === 0) {
    const noResults = document.createElement("div");
    noResults.style.cssText = "text-align: center; padding: 60px 20px; color: #7c7c7c;";
    noResults.innerHTML = `
      <i data-lucide="search-x" style="width: 48px; height: 48px; margin: 0 auto 16px; display: block; color: #ccc;"></i>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No articles found</div>
      <div style="font-size: 14px;">${searchQuery ? 'Try a different search term' : 'No articles available'}</div>
    `;
    feed.appendChild(noResults);
    lucide.createIcons();
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  visible.forEach(post => {
    const item = document.createElement("div");
    item.className = "post-card";
    item.setAttribute("data-collection", post.collection);
    
    const icon = getCollectionIcon(post.collection);
    const isSaved = savedPosts.includes(post.url);
    
    const isSticker = post.collection === 'collection4';
    const isObject = post.collection === 'objects';
    const isJordan = post.collection === 'jordan';
    const isPhoto = post.collection === 'photos';
    const fullscreenData = (isSticker || isObject || isJordan || isPhoto) ? JSON.stringify(post) : '';
    
    item.innerHTML = `
      <a href="${post.url}" target="_blank" style="display: block; color: inherit;" data-article-link='${JSON.stringify({url: post.url, title: post.title, image: post.image || ''})}' data-fullscreen-data='${fullscreenData}' data-type='${post.collection}'>
        <div class="post-header">
          <div class="post-avatar">
            <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
          </div>
          <div class="post-meta">
            <div class="post-source">${post.collectionName}</div>
            <div class="post-date">${post.date}</div>
          </div>
        </div>
        ${(!post.image || post.image.trim() === "") 
           ? "" 
           : `<img class="post-image" src="${post.image}" alt="${post.title}" loading="lazy">`}
        <div class="post-content">
          <div class="post-title">${post.title}</div>
          ${post.text ? `<div class="post-excerpt">${post.text}</div>` : ''}
          ${post.medium ? `<div class="post-excerpt"><strong>Medium:</strong> ${post.medium}</div>` : ''}
          ${post.location ? `<div class="post-excerpt"><strong>Location:</strong> ${post.location}</div>` : ''}
          ${post.notes ? `<div class="post-excerpt"><strong>Notes:</strong> ${post.notes}</div>` : ''}
        </div>
      </a>
      <div class="post-footer">
        <span class="post-action" data-read='${JSON.stringify({url: post.url, title: post.title, image: post.image || ''})}'>
          <i data-lucide="external-link"></i> Read
        </span>
        <span class="post-action ${isSaved ? 'saved' : ''}" data-save-url="${post.url}">
          <i data-lucide="${isSaved ? 'bookmark-check' : 'bookmark'}"></i> ${isSaved ? 'Saved' : 'Save'}
        </span>
        <span class="post-action" data-share='${JSON.stringify({title: post.title, url: post.url})}'>
          <i data-lucide="share-2"></i> Share
        </span>
      </div>
    `;
    
    fragment.appendChild(item);
  });
  
  feed.appendChild(fragment);
  lucide.createIcons();
  
  const endOfFeed = document.getElementById('endOfFeed');
  if (visible.length >= sorted.length) {
    endOfFeed.style.display = 'block';
  } else {
    endOfFeed.style.display = 'none';
  }
  
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-fullscreen-data]').forEach(link => {
      const data = link.dataset.fullscreenData;
      const type = link.dataset.type;
      
      if (type === "jordan") {
        const item = JSON.parse(data);
        if (item.url && item.url !== "#" && item.url.trim() !== "") {
          link.onclick = (e) => {
            e.preventDefault();
            const d = JSON.parse(link.dataset.articleLink);
            addToHistory(d);
            window.open(item.url, "_blank");
          };
          return;
        }
        if (item.image && item.image.trim() !== "") {
          link.onclick = (e) => {
            e.preventDefault();
            document.getElementById('stickerFullscreenImage').src = item.image;
            document.getElementById('stickerFullscreenDate').textContent = "";
            document.getElementById('stickerFullscreenLocation').textContent = "";
            document.getElementById('stickerFullscreenMedium').textContent = "";
            document.getElementById('stickerFullscreenArtist').textContent = "";
            document.getElementById('stickerFullscreen').classList.add('active');
            document.body.style.overflow = 'hidden';
            addToHistory({ url: item.url, title: item.title, image: item.image });
          };
          return;
        }
        link.onclick = (e) => {
          e.preventDefault();
        };
        return;
      }
      
      if (data && type === "collection4") {
        link.onclick = (e) => {
          e.preventDefault();
          const item = JSON.parse(data);
          openStickerFullscreen(item);
          addToHistory({ url: item.url, title: item.title, image: item.image });
        };
        return;
      }
      
      if (data && type === "objects") {
        link.onclick = (e) => {
          e.preventDefault();
          const item = JSON.parse(data);
          openObjectFullscreen(item);
          addToHistory({ url: item.url, title: item.text, image: item.image });
        };
        return;
      }
      
      if (data && type === "photos") {
        link.onclick = (e) => {
          e.preventDefault();
          const item = JSON.parse(data);
          openPhotoFullscreen(item);
          addToHistory({ url: item.url, title: item.title, image: item.image });
        };
        return;
      }
      
      if (!data) {
        link.onclick = (e) => {
          const articleData = JSON.parse(link.dataset.articleLink);
          addToHistory(articleData);
        };
        return;
      }
    });
    
    document.querySelectorAll('[data-read]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const data = JSON.parse(btn.dataset.read);
        addToHistory(data);
        window.open(data.url, '_blank');
      };
    });
    
    document.querySelectorAll('[data-save-url]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        savePost(btn.dataset.saveUrl);
      };
    });
    
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sharePost(JSON.parse(btn.dataset.share));
      };
    });
  });
}

document.querySelectorAll('.nav-item[data-filter]').forEach(item => {
  item.addEventListener("click", function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    currentView = "feed";
    displayLimit = 10;
    closeMobileMenuOnClick();
    render();
  });
});

document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener("click", function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    currentView = this.dataset.view;
    closeMobileMenuOnClick();
    render();
  });
});

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentSort = this.dataset.sort;
    render();
  });
});

document.getElementById("searchBox").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  displayLimit = 10;
  
  if (searchQuery) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
    currentFilter = "all";
    currentView = "feed";
  }
  
  render();
});

let isLoadingMore = false;
window.addEventListener('scroll', () => {
  if (currentView !== "feed") return;
  if (isLoadingMore) return;
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollPosition >= documentHeight - 500) {
    const filtered = filterPosts(allPosts);
    const sorted = sortPosts(filtered);
    
    if (displayLimit < sorted.length) {
      isLoadingMore = true;
      displayLimit += 10;
      render();
      setTimeout(() => {
        isLoadingMore = false;
      }, 500);
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
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
      
    case 'm':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="photos-index"]').click();
      break;
      
    case 'l':
      e.preventDefault();
      document.querySelector('.nav-item[data-view="pictures-index"]').click();
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
      
    case 'escape':
      if (document.getElementById('stickerFullscreen').classList.contains('active')) {
        closeStickerFullscreen(e);
      }
      if (document.getElementById('keyboardShortcutsModal')) {
        closeKeyboardShortcuts();
      }
      break;
  }
});

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
              <span>Go to Field Notes</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">1</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Articles</span>
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
              <span>Go to Saved</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">5</kbd> or <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">S</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Go to Photos</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">6</kbd>
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
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">M</kbd>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edeff1;">
              <span>Pictures Index</span>
              <kbd style="background: #f6f7f8; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">L</kbd>
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllData);
} else {
  loadAllData();
}

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
