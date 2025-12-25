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
    map = L.map('mapContainer', {
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

  function createMarker(item, coords) {
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

    // Create popup content
    const popupContent = createPopupContent(item);
    
    marker.bindPopup(popupContent, {
      maxWidth: 400,
      minWidth: 300,
      className: 'map-popup'
    });

    // Add click handler to show full overlay
    marker.on('click', function() {
      // Find index in filteredImages if it exists
      const index = window.filteredImages ? window.filteredImages.findIndex(img => img.src === item.src) : -1;
      
      // Open popup first
      marker.openPopup();
      
      // Add click handler to image in popup after a short delay to ensure popup is rendered
      setTimeout(() => {
        const popupImg = document.querySelector('.map-popup-image');
        if (popupImg && index !== -1) {
          popupImg.style.cursor = 'pointer';
          popupImg.onclick = function() {
            // Close map
            toggleMap();
            // Show full overlay
            if (typeof window.showOverlay === 'function') {
              window.showOverlay(index);
            }
          };
        }
      }, 100);
    });

    return marker;
  }

  function createPopupContent(item) {
    const div = document.createElement('div');
    div.className = 'map-popup-content';
    div.style.cssText = 'text-align: center;';

    // Image
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

    // Click to expand hint
    const hint = document.createElement('div');
    hint.style.cssText = `
      margin-top: 10px;
      font-size: 12px;
      color: #666;
      font-style: italic;
    `;
    hint.textContent = 'Click image to view full size';
    div.appendChild(hint);

    return div;
  }

  // ============================================================================
  // LOAD MAP DATA
  // ============================================================================

  function loadMapData(americanismsData) {
    if (!map) initMap();

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    let validCount = 0;
    let invalidCount = 0;

    americanismsData.forEach(item => {
      // Column I should be the coordinates column
      const coordString = item.coordinates || item.Coordinates || item.I || '';
      
      if (coordString) {
        const coords = parseCoordinates(coordString);
        
        if (coords) {
          const marker = createMarker(item, coords);
          marker.addTo(map);
          markers.push(marker);
          validCount++;
        } else {
          invalidCount++;
          console.warn('Invalid coordinates:', coordString, 'for item:', item.src);
        }
      }
    });

    console.log(`Map loaded: ${validCount} valid markers, ${invalidCount} invalid coordinates`);

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
          const count = loadMapData(americanismsItems);
          
          if (count === 0) {
            alert('No coordinates found in the data. Make sure column I contains coordinates in the format "latitude, longitude".');
          }
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
