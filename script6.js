// Main render function
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
  
  hideFullscreenToggle();
  
  document.querySelector('.sort-bar').style.display = 'flex';
  
  const feed = document.getElementById("feedItems");
  feed.innerHTML = "";
  
  const filtered = filterPosts(allPosts);
  const sorted = sortPosts(filtered);
  const visible = sorted.slice(0, displayLimit);
  
  console.log('Rendering posts:', {
    total: allPosts.length,
    filtered: filtered.length,
    sorted: sorted.length,
    visible: visible.length,
    displayLimit: displayLimit,
    currentFilter: currentFilter
  });

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

    item.innerHTML = `
      <a href="${post.url}" target="_blank" style="display: block; color: inherit;" data-type='${post.collection}'>
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
          ${post.photographer && post.collection !== 'photos' ? `<div class="post-excerpt"><strong>Photographer:</strong> ${post.photographer}</div>` : ''}
        </div>
      </a>
      <div class="post-footer">
        <span class="post-action" data-action="read">
          <i data-lucide="external-link"></i> Read
        </span>
        <span class="post-action ${isSaved ? 'saved' : ''}" data-action="save">
          <i data-lucide="${isSaved ? 'bookmark-check' : 'bookmark'}"></i> ${isSaved ? 'Saved' : 'Save'}
        </span>
        <span class="post-action" data-action="share">
          <i data-lucide="share-2"></i> Share
        </span>
      </div>
    `;
    
    // Store post data directly on the element
    item._postData = post;
    
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
    document.querySelectorAll('.post-card').forEach(card => {
      const link = card.querySelector('a');
      const post = card._postData;
      const type = link.dataset.type;

      if (type === "jordan") {
        if (post.url && post.url !== "#" && post.url.trim() !== "") {
          link.onclick = (e) => {
            e.preventDefault();
            addToHistory({url: post.url, title: post.title, image: post.image || ''});
            window.open(post.url, "_blank");
          };
        } else if (post.image && post.image.trim() !== "") {
          link.onclick = (e) => {
            e.preventDefault();
            document.getElementById('stickerFullscreenImage').src = post.image;
            document.getElementById('stickerFullscreen').classList.add('active');
            document.body.style.overflow = 'hidden';
            addToHistory({ url: post.url, title: post.title, image: post.image });
          };
        } else {
          link.onclick = (e) => {
            e.preventDefault();
          };
        }
      } else if (type === "collection4") {
        link.onclick = (e) => {
          e.preventDefault();
          openStickerFullscreen(post);
          addToHistory({ url: post.url, title: post.title, image: post.image });
        };
      } else if (type === "objects") {
        link.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openObjectFullscreen(post);
          addToHistory({ url: post.url, title: post.title, image: post.image });
        };
      } else if (type === "photos") {
        link.onclick = (e) => {
          e.preventDefault();
          openPhotoFullscreen(post);
          addToHistory({ url: post.url, title: post.photographer, image: post.image });
        };
      } else {
        link.onclick = (e) => {
          addToHistory({url: post.url, title: post.title, image: post.image || ''});
        };
      }
    });

    document.querySelectorAll('[data-action="read"]').forEach(btn => {
      const card = btn.closest('.post-card');
      const post = card._postData;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToHistory({url: post.url, title: post.title, image: post.image || ''});
        window.open(post.url, '_blank');
      };
    });

    document.querySelectorAll('[data-action="save"]').forEach(btn => {
      const card = btn.closest('.post-card');
      const post = card._postData;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        savePost(post.url);
      };
    });

    document.querySelectorAll('[data-action="share"]').forEach(btn => {
      const card = btn.closest('.post-card');
      const post = card._postData;
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sharePost({title: post.title, url: post.url});
      };
    });
  });
}

// Event listeners for navigation
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

// Infinite scroll
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

// Keyboard shortcuts (continued in next file due to length)
