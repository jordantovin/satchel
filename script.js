// Configuration and CSV URLs
const sheetURL1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTo8ua4UreD9MUP4CI6OOXkt8LeagGX9w85veJfgi9DKJnHc2-dbCMvq5cx8DtlUO0YcV5RMPzcJ_KG/pub?output=csv";
const sheetURL2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcOtzV-2ZVl1aaRXhnlXEDNmJ8y1pUArx3qjhV3AR66kKSMtR17702FGlrBdppy0YPI084PxrMu9uL/pub?output=csv";
const sheetURL3 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UTNOg8d2LIrCU8A9ebfkYOMV2V3E7egroQgliVc4v6mp7Xi9fdmPaxN3k3YUmeW123C8UvwdiNmy/pub?output=csv";
const sheetURL4 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-tRe4QAkAIideMvvWDNWq2Aj_Nx6m4QG9snhFkpqqOGX8gU09X6uUQdkfuOj9yLIybn0iPIFoZbK-/pub?output=csv";
const sheetURL5 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv";
const sheetURL6 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgrPlpxYaFJdMcgf_-UT0hA4u-uzsbXlgOwVaI2ox9S44XPXySHiNogkYfkno84Ur5V0oCMet0thHp/pub?output=csv";

// Global state variables
let jordanPosts = [];
let objectsIndex = [];
let allPosts = [];
let photographers = [];
let stickersIndex = [];
let articlesIndex = [];
let displayLimit = 10;
let currentFilter = "all";
let currentSort = "date-newest";
let savedPosts = JSON.parse(localStorage.getItem('satchelSaved') || '[]');
let searchQuery = "";
let viewHistory = JSON.parse(localStorage.getItem('satchelHistory') || '[]');
let currentView = "feed";

// Mobile menu functions
function toggleMobileMenu() {
  document.querySelector('.left-sidebar').classList.toggle('mobile-open');
  document.body.classList.toggle('menu-open');
}

function closeMobileMenuOnClick() {
  if (window.innerWidth <= 768) {
    document.querySelector('.left-sidebar').classList.remove('mobile-open');
    document.body.classList.remove('menu-open');
  }
}

// Date normalization utility
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  dateStr = dateStr.trim();
  
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }
  
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
  }
  
  if (/^\d{4}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[1].padStart(2, '0')}/01/${parts[0]}`;
  }
  
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
  }
  
  if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[1].padStart(2, '0')}/01/${parts[0]}`;
  }
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    }
  } catch (e) {}
  
  return dateStr;
}

// Get icon for collection type
function getCollectionIcon(collection) {
  const icons = {
    'collection1': 'newspaper',
    'collection2': 'pencil',
    'collection4': 'sticker',
    'photographer': 'users',
    'objects': 'box',
    'jordan': 'camera'
  };
  return icons[collection] || 'file';
}

// Post actions
function savePost(postUrl) {
  if (savedPosts.includes(postUrl)) {
    savedPosts = savedPosts.filter(url => url !== postUrl);
  } else {
    savedPosts.push(postUrl);
  }
  localStorage.setItem('satchelSaved', JSON.stringify(savedPosts));
  document.getElementById('countSaved').textContent = savedPosts.length;
  render();
}

function sharePost(post) {
  if (navigator.share) {
    navigator.share({
      title: post.title,
      text: `Check out this article: ${post.title}`,
      url: post.url
    }).catch(err => {
      if (err.name !== 'AbortError') {
        copyToClipboard(post.url);
      }
    });
  } else {
    copyToClipboard(post.url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
  });
}

function formatCommentTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function goToAllPosts() {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
  currentFilter = "all";
  currentView = "feed";
  searchQuery = "";
  document.getElementById('searchBox').value = "";
  displayLimit = 10;
  closeMobileMenuOnClick();
  render();
}

function randomPhotographer() {
  if (photographers.length === 0) return;
  const random = photographers[Math.floor(Math.random() * photographers.length)];
  window.open(random.website, '_blank');
  addToHistory({
    url: random.website,
    title: random.name,
    image: ''
  });
}
