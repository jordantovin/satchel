// ============================================================================
// AMERICANISMS GALLERY - MAP MODULE
// Interactive map with clickable markers showing images and metadata
// ============================================================================

(function() {
  'use strict';

  let map = null;
  let markers = [];
  let mapVisible = false;
  let currentLayer = 'standard';

  // Map layers
  let standardLayer = null;
  let satelliteLayer = null;

  // ============================================================================
  // MAP INITIALIZATION
  // ============================================================================

  function initMap() {
    if (map) return; // Already initialized

    // Create map centered on Washington DC
    map = L.map('map', {
      center: [38.9072, -77.0369], // Washington DC coordinates
      zoom: 12,
      zoomControl: true
    });

    // Standard OpenStreetMap layer
    standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    // Satellite layer (ESRI World Imagery)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    });

    // Add standard layer by default
    standardLayer.addTo(map);

    // Add layer control in top-right
    const layerControl = L.control.layers({
      'Standard': standardLayer,
      'Satellite': satelliteLayer
    }, null, {
      position: 'topright'
    }).addTo(map);
  }

  // ============================================================================
  // COORDINATE PARSING
  // ============================================================================

  function parseCoordinates(coordString) {
    if (!coordString || typeof coordString !== 'string') return null;

    // Clean the string
    coordString = coordString.trim();

    // Try to parse various formats:
    // "40.7128, -74.0060"
    // "40.7128,-74.0060"
    // "40.7128 -74.0060"
    
    const patterns = [
      /^([-+]?\d+\.?\d*)[,\s]+([-+]?\d+\.?\d*)$/, // lat, lon or lat lon
      /^([-+]?\d+\.?\d*)\s*[,;]\s*([-+]?\d+\.?\d*)$/ // with semicolon
    ];

    for (const pattern of patterns) {
      const match = coordString.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          return { lat, lon };
        }
      }
    }

    return null;
  }

  // ============================================================================
  // MARKER CREATION
  // ============================================================================

  function createMarker(items, coords) {
    // items can be a single item or array of items at the same location
    const itemsArray = Array.isArray(items) ? items : [items];
    let currentIndex = 0;

    const marker = L.marker([coords.lat, coords.lon], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    });

    // Function to create and update popup content
    function updatePopup() {
      const item = itemsArray[currentIndex];
      const popupContent = createPopupContent(item, currentIndex, itemsArray.length);
      
      // Set the popup content
      if (marker.getPopup()) {
        marker.getPopup().setContent(popupContent);
      } else {
        marker.bindPopup(popupContent, {
          maxWidth: 400,
          minWidth: 300,
          className: 'map-popup'
        });
      }
      
      // Attach event listeners after a brief delay to ensure DOM is ready
      setTimeout(() => {
        attachPopupEventListeners(itemsArray, currentIndex);
        attachNavigationListeners();
      }, 50);
    }

    // Function to attach navigation button listeners
    function attachNavigationListeners() {
      if (itemsArray.length > 1) {
        const prevBtn = document.querySelector('.popup-prev-btn');
        const nextBtn = document.querySelector('.popup-next-btn');
        
        if (prevBtn) {
          prevBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
            updatePopup();
          };
        }
        
        if (nextBtn) {
          nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % itemsArray.length;
            updatePopup();
          };
        }
      }
    }

    // Initialize popup
    updatePopup();

    // Re-attach listeners when popup opens
    marker.on('popupopen', function() {
      setTimeout(() => {
        attachPopupEventListeners(itemsArray, currentIndex);
        attachNavigationListeners();
      }, 50);
    });

    return marker;
  }

  function attachPopupEventListeners(itemsArray, currentIndex) {
    const popupImg = document.querySelector('.map-popup-image');
    if (popupImg) {
      const item = itemsArray[currentIndex];
      
      // Only attach click handler for Americanisms items that have images
      if (item.dataSource === 'americanisms' && item.src) {
        const index = window.filteredImages ? window.filteredImages.findIndex(img => img.src === item.src) : -1;
        
        if (index !== -1) {
          popupImg.style.cursor = 'pointer';
          popupImg.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Don't toggle map - keep it open in background
            if (typeof window.showOverlay === 'function') {
              window.showOverlay(index);
            }
          };
        }
      }
    }
  }

  function createPopupContent(item, currentIndex, totalItems) {
    const div = document.createElement('div');
    div.className = 'map-popup-content';
    div.style.cssText = 'text-align: center;';

    // Multiple items indicator and navigation
    if (totalItems > 1) {
      const nav = document.createElement('div');
      nav.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px;
        background: #f5f5f5;
        border: 1px solid #000;
      `;
      
      const prevBtn = document.createElement('button');
      prevBtn.className = 'popup-prev-btn';
      prevBtn.innerHTML = '←';
      prevBtn.style.cssText = `
        background: white;
        border: 2px solid #000;
        padding: 4px 12px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        transition: background-color 0.2s, color 0.2s;
      `;
      prevBtn.onmouseover = function() {
        this.style.backgroundColor = '#000';
        this.style.color = 'white';
      };
      prevBtn.onmouseout = function() {
        this.style.backgroundColor = 'white';
        this.style.color = '#000';
      };
      
      const counter = document.createElement('span');
      counter.textContent = `${currentIndex + 1} of ${totalItems}`;
      counter.style.cssText = 'font-weight: bold; font-size: 14px;';
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'popup-next-btn';
      nextBtn.innerHTML = '→';
      nextBtn.style.cssText = `
        background: white;
        border: 2px solid #000;
        padding: 4px 12px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        transition: background-color 0.2s, color 0.2s;
      `;
      nextBtn.onmouseover = function() {
        this.style.backgroundColor = '#000';
        this.style.color = 'white';
      };
      nextBtn.onmouseout = function() {
        this.style.backgroundColor = 'white';
        this.style.color = '#000';
      };
      
      nav.appendChild(prevBtn);
      nav.appendChild(counter);
      nav.appendChild(nextBtn);
      div.appendChild(nav);
    }

    // Different content based on data source
    if (item.dataSource === 'secondary') {
      // For secondary CSV: simple text-based display
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 20px;
        text-align: left;
        font-family: Helvetica, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        border: 2px solid #000;
        background: white;
      `;

      let html = '';
      
      // Date found (Column A)
      if (item.A) {
        html += `<div style="margin-bottom: 12px;"><strong>Date Found:</strong> ${item.A}</div>`;
      }
      
      // Object name (Column B)
      if (item.B) {
        html += `<div><strong>Object:</strong> ${item.B}</div>`;
      }

      content.innerHTML = html;
      div.appendChild(content);
      
    } else {
      // For Americanisms data: show image and full metadata
      const img = document.createElement('img');
      img.src = item.src;
      img.className = 'map-popup-image';
      img.style.cssText = `
        width: 100%;
        max-height: 250px;
        object-fit: contain;
        margin-bottom: 12px;
        border: 2px solid #000;
      `;
      div.appendChild(img);

      // Metadata
      const metadata = document.createElement('div');
      metadata.style.cssText = `
        text-align: left;
        font-size: 14px;
        line-height: 1.4;
        font-family: Helvetica, sans-serif;
      `;

      let metadataHTML = '';
      
      if (item.date) {
        metadataHTML += `<strong>Date:</strong> ${item.date}<br>`;
      }
      
      if (item.location_card) {
        metadataHTML += `<strong>Location:</strong><br>${item.location_card.replace(/\n/g, '<br>')}<br>`;
      }
      
      if (item.medium) {
        metadataHTML += `<strong>Medium:</strong> ${item.medium}<br>`;
      }
      
      if (item.artist) {
        metadataHTML += `<strong>Artist:</strong> ${item.artist}`;
      }

      metadata.innerHTML = metadataHTML;
      div.appendChild(metadata);

      // Click to expand hint (only for images)
      const hint = document.createElement('div');
      hint.style.cssText = `
        margin-top: 10px;
        font-size: 12px;
        color: #666;
        font-style: italic;
      `;
      hint.textContent = 'Click image to view full size';
      div.appendChild(hint);
    }

    return div;
  }

  // ============================================================================
  // LOAD MAP DATA
  // ============================================================================

  async function loadSecondaryCSV() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPknkbhkxJidsCcMnFmvdB2gKx4miqtuECGc5udX7hEAY9IQeTCpNDGMkh31uGuSS1NcODADU_jcRT/pub?output=csv';
    
    try {
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      // Parse CSV - handle quoted fields properly
      const lines = csvText.split('\n');
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parsing - split by comma but respect quotes
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        // Map to column letters (A, B, C, ... I)
        const row = {};
        const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        columns.forEach((col, index) => {
          row[col] = values[index] || '';
        });
        
        data.push(row);
      }
      
      console.log(`Loaded ${data.length} items from secondary CSV`);
      return data;
    } catch (error) {
      console.error('Error loading secondary CSV:', error);
      return [];
    }
  }

  async function loadMapData(americanismsData) {
    if (!map) initMap();

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Group items by coordinates
    const locationGroups = {};
    let validCount = 0;
    let invalidCount = 0;

    // Process Americanisms data
    americanismsData.forEach(item => {
      // Column I should be the coordinates column
      const coordString = item.coordinates || item.Coordinates || item.I || '';
      
      if (coordString) {
        const coords = parseCoordinates(coordString);
        
        if (coords) {
          // Create a key for this coordinate pair
          const coordKey = `${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`;
          
          if (!locationGroups[coordKey]) {
            locationGroups[coordKey] = {
              coords: coords,
              items: []
            };
          }
          
          locationGroups[coordKey].items.push({
            ...item,
            dataSource: 'americanisms'
          });
          validCount++;
        } else {
          invalidCount++;
          console.warn('Invalid coordinates:', coordString, 'for item:', item.src);
        }
      }
    });

    // Load and process secondary CSV data
    const secondaryData = await loadSecondaryCSV();
    secondaryData.forEach(item => {
      // Column I contains coordinates
      const coordString = item.I || '';
      
      if (coordString) {
        const coords = parseCoordinates(coordString);
        
        if (coords) {
          const coordKey = `${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`;
          
          if (!locationGroups[coordKey]) {
            locationGroups[coordKey] = {
              coords: coords,
              items: []
            };
          }
          
          locationGroups[coordKey].items.push({
            ...item,
            dataSource: 'secondary'
          });
          validCount++;
        } else {
          invalidCount++;
        }
      }
    });

    // Create markers for each location (with potentially multiple items)
    Object.values(locationGroups).forEach(location => {
      const marker = createMarker(location.items, location.coords);
      marker.addTo(map);
      markers.push(marker);
    });

    console.log(`Map loaded: ${validCount} items at ${markers.length} unique locations, ${invalidCount} invalid coordinates`);

    // Fit map to show all markers if any exist
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return validCount;
  }

  // ============================================================================
  // MAP TOGGLE
  // ============================================================================

  function toggleMap() {
    const mapContainer = document.getElementById('mapContainer');
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    
    if (!mapContainer || !mapToggleBtn) return;

    mapVisible = !mapVisible;

    if (mapVisible) {
      mapContainer.style.display = 'block';
      mapToggleBtn.classList.add('active');
      
      // Initialize map if needed
      if (!map) {
        initMap();
        
        // Load data from global allData if available
        if (window.allData && window.allData.objects) {
          const americanismsItems = window.allData.objects.filter(item => item.source === 'Americanisms');
          loadMapData(americanismsItems).then(count => {
            if (count === 0) {
              alert('No coordinates found in the data. Make sure column I contains coordinates in the format "latitude, longitude".');
            }
          });
        }
      }
      
      // Invalidate size to fix display issues
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
    } else {
      mapContainer.style.display = 'none';
      mapToggleBtn.classList.remove('active');
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  window.toggleMap = toggleMap;
  window.loadMapData = loadMapData;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function initMapModule() {
    // Map toggle button already exists in HTML
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    if (mapToggleBtn) {
      mapToggleBtn.addEventListener('click', toggleMap);
    }

    // Add custom styles for map popup
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-popup-content-wrapper {
        border-radius: 0 !important;
        border: 2px solid #000 !important;
      }
      
      .leaflet-popup-tip {
        border: 2px solid #000 !important;
      }
      
      .map-popup-content {
        padding: 8px;
      }
      
      .map-popup-image {
        transition: opacity 0.2s;
      }
      
      .map-popup-image:hover {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapModule);
  } else {
    initMapModule();
  }

})();
