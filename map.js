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
  let currentMapLayer = 'standard'; // Track current layer

  // Marker filter state
  let showObjects = true;
  let showStickers = true;
  let markerLayers = {
    objects: L.layerGroup(),
    stickers: L.layerGroup()
  };

  // ============================================================================
  // LAYER TOGGLE
  // ============================================================================

  function toggleMapLayer() {
    if (currentMapLayer === 'standard') {
      // Switch to satellite
      map.removeLayer(standardLayer);
      satelliteLayer.addTo(map);
      currentMapLayer = 'satellite';
      
      // Update button
      const layerBtn = document.getElementById('mapLayerBtn');
      if (layerBtn) {
        layerBtn.textContent = 'SAT';
      }
    } else {
      // Switch to standard
      map.removeLayer(satelliteLayer);
      standardLayer.addTo(map);
      currentMapLayer = 'standard';
      
      // Update button
      const layerBtn = document.getElementById('mapLayerBtn');
      if (layerBtn) {
        layerBtn.innerHTML = `
          <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
            <path d="M 13 1.188 L 2.094 6.688 L 13 12.219 L 23.906 6.688 Z M 13 14.813 L 2.094 9.313 L 2 19.688 L 13 25.219 L 24 19.688 L 23.906 9.313 Z" fill="currentColor"/>
          </svg>
        `;
      }
    }
  }

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

    // Don't add Leaflet's layer control - we'll handle it ourselves

    // Add marker layers to map
    markerLayers.objects.addTo(map);
    markerLayers.stickers.addTo(map);
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

    // Determine marker color based on data source
    // If mixed, use objects color (red)
    const hasObjects = itemsArray.some(item => item.dataSource === 'secondary');
    const hasStickers = itemsArray.some(item => item.dataSource === 'americanisms');
    
    let color;
    let markerType;
    
    if (hasObjects && hasStickers) {
      // Mixed - use purple
      color = '#7b2d8e';
      markerType = 'objects'; // Add to objects layer for filtering
    } else if (hasObjects) {
      // Objects - use red
      color = '#d63e2a';
      markerType = 'objects';
    } else {
      // Stickers - use blue
      color = '#2a81d6';
      markerType = 'stickers';
    }

    const marker = L.circleMarker([coords.lat, coords.lon], {
      radius: 8,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.9
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
            
            // Reattach listeners after update
            setTimeout(() => {
              attachPopupEventListeners(itemsArray, currentIndex);
              attachNavigationListeners();
            }, 100);
          };
        }
        
        if (nextBtn) {
          nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % itemsArray.length;
            updatePopup();
            
            // Reattach listeners after update
            setTimeout(() => {
              attachPopupEventListeners(itemsArray, currentIndex);
              attachNavigationListeners();
            }, 100);
          };
        }
      }
    }

    // Initialize popup
    updatePopup();

    // Ensure popup opens properly and attach listeners when it does
    marker.on('popupopen', function(e) {
      // Update the popup content to ensure it's current
      updatePopup();
      
      // Attach event listeners after DOM is ready
      setTimeout(() => {
        attachPopupEventListeners(itemsArray, currentIndex);
        attachNavigationListeners();
      }, 100);
    });

    // Add marker to appropriate layer
    marker.addTo(markerLayers[markerType]);
    marker._markerType = markerType;

    return marker;
  }

  function attachPopupEventListeners(itemsArray, currentIndex) {
    const popupImg = document.querySelector('.map-popup-image');
    if (popupImg) {
      const item = itemsArray[currentIndex];
      
      // Handle clicks for both data sources
      if (item.dataSource === 'americanisms' && item.src) {
        // For stickers - open in overlay
        const index = window.filteredImages ? window.filteredImages.findIndex(img => img.src === item.src) : -1;
        
        if (index !== -1) {
          popupImg.style.cursor = 'pointer';
          popupImg.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close the popup first
            if (map) {
              map.closePopup();
            }
            
            // Open overlay
            if (typeof window.showOverlay === 'function') {
              window.showOverlay(index);
            }
          };
        }
      } else if (item.dataSource === 'secondary' && item.E) {
        // For objects - open image in new tab
        popupImg.style.cursor = 'pointer';
        popupImg.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.open(item.E, '_blank');
        };
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
      // For secondary CSV: show image with simplified metadata
      
      // Image (Column E)
      if (item.E) {
        const img = document.createElement('img');
        img.src = item.E;
        img.className = 'map-popup-image';
        img.style.cssText = `
          width: 100%;
          max-height: 250px;
          object-fit: contain;
          margin-bottom: 12px;
          border: 2px solid #000;
        `;
        
        div.appendChild(img);
      }

      // Metadata
      const metadata = document.createElement('div');
      metadata.style.cssText = `
        text-align: left;
        font-size: 14px;
        line-height: 1.6;
        font-family: Helvetica, sans-serif;
        padding: 8px;
        background: #f9f9f9;
        border: 1px solid #ddd;
      `;

      let metadataHTML = '';
      
      // Date found (Column A)
      if (item.A) {
        metadataHTML += `<div style="margin-bottom: 6px;"><strong>Date Found:</strong> ${item.A}</div>`;
      }
      
      // Object name (Column B)
      if (item.B) {
        metadataHTML += `<div><strong>Object:</strong> ${item.B}</div>`;
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
      hint.textContent = 'Click image to open full size';
      div.appendChild(hint);
      
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
        line-height: 1.6;
        font-family: Helvetica, sans-serif;
        padding: 8px;
        background: #f9f9f9;
        border: 1px solid #ddd;
      `;

      let metadataHTML = '';
      
      if (item.date) {
        metadataHTML += `<div style="margin-bottom: 6px;"><strong>Date:</strong> ${item.date}</div>`;
      }
      
      if (item.location_card) {
        metadataHTML += `<div style="margin-bottom: 6px;"><strong>Location:</strong><br>${item.location_card.replace(/\n/g, '<br>')}</div>`;
      }
      
      if (item.medium) {
        metadataHTML += `<div style="margin-bottom: 6px;"><strong>Medium:</strong> ${item.medium}</div>`;
      }
      
      if (item.artist) {
        metadataHTML += `<div><strong>Artist:</strong> ${item.artist}</div>`;
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
      
      if (!response.ok) {
        console.warn('Failed to fetch secondary CSV:', response.status);
        return [];
      }
      
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
    markerLayers.objects.clearLayers();
    markerLayers.stickers.clearLayers();

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

    // Load and process secondary CSV data - but don't let it break the map
    try {
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
    } catch (error) {
      console.error('Failed to load secondary CSV, continuing with Americanisms data only:', error);
    }

    // Create markers for each location (with potentially multiple items)
    Object.values(locationGroups).forEach(location => {
      const marker = createMarker(location.items, location.coords);
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
  // MAP TOGGLE & FILTER
  // ============================================================================

  function toggleMap() {
    const mapContainer = document.getElementById('mapContainer');
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    
    console.log('toggleMap called', { mapContainer: !!mapContainer, mapToggleBtn: !!mapToggleBtn, mapVisible });
    
    if (!mapContainer) {
      console.error('mapContainer element not found');
      return;
    }
    
    if (!mapToggleBtn) {
      console.error('mapToggleBtn element not found');
      return;
    }

    mapVisible = !mapVisible;
    console.log('Map visibility toggled to:', mapVisible);

    if (mapVisible) {
      // Force display
      mapContainer.style.cssText = 'display: block !important; position: fixed; top: 60px; left: 0; right: 0; bottom: 0; z-index: 5000; background: white; border-top: 2px solid #000;';
      mapToggleBtn.classList.add('active');
      
      // Initialize map if needed
      if (!map) {
        console.log('Initializing map for first time...');
        try {
          initMap();
          
          // Load data from global allData if available
          if (window.allData && window.allData.objects) {
            const americanismsItems = window.allData.objects.filter(item => item.source === 'Americanisms');
            console.log('Loading', americanismsItems.length, 'items onto map');
            
            loadMapData(americanismsItems).then(count => {
              console.log(`Map initialized with ${count} items`);
            }).catch(error => {
              console.error('Error loading map data:', error);
            });
          } else {
            console.warn('No data found to load on map');
          }
        } catch (error) {
          console.error('Error initializing map:', error);
          mapVisible = false;
          mapContainer.style.display = 'none';
          mapToggleBtn.classList.remove('active');
          return;
        }
      }
      
      // Invalidate size to fix display issues
      setTimeout(() => {
        if (map) {
          console.log('Invalidating map size...');
          map.invalidateSize();
        }
      }, 100);
    } else {
      console.log('Hiding map');
      mapContainer.style.display = 'none';
      mapToggleBtn.classList.remove('active');
    }
  }

  function toggleMarkerFilter(type) {
    if (type === 'objects') {
      showObjects = !showObjects;
      if (showObjects) {
        map.addLayer(markerLayers.objects);
      } else {
        map.removeLayer(markerLayers.objects);
      }
    } else if (type === 'stickers') {
      showStickers = !showStickers;
      if (showStickers) {
        map.addLayer(markerLayers.stickers);
      } else {
        map.removeLayer(markerLayers.stickers);
      }
    }
    
    // Update button states
    updateFilterButtons();
  }

  function updateFilterButtons() {
    const objectsBtn = document.getElementById('filterObjectsBtn');
    const stickersBtn = document.getElementById('filterStickersBtn');
    
    if (objectsBtn) {
      if (showObjects) {
        objectsBtn.classList.add('active');
      } else {
        objectsBtn.classList.remove('active');
      }
    }
    
    if (stickersBtn) {
      if (showStickers) {
        stickersBtn.classList.add('active');
      } else {
        stickersBtn.classList.remove('active');
      }
    }
  }

  function toggleMapKey() {
    const keyPanel = document.getElementById('mapKeyPanel');
    if (keyPanel) {
      keyPanel.style.display = keyPanel.style.display === 'none' ? 'block' : 'none';
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  window.toggleMap = toggleMap;
  window.loadMapData = loadMapData;
  window.toggleMarkerFilter = toggleMarkerFilter;
  window.toggleMapKey = toggleMapKey;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function initMapModule() {
    console.log('Initializing map module...');
    
    // Map toggle button already exists in HTML
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    if (mapToggleBtn) {
      console.log('Map toggle button found, attaching listeners...');
      
      // Remove any existing listeners first
      const freshBtn = mapToggleBtn.cloneNode(true);
      mapToggleBtn.parentNode.replaceChild(freshBtn, mapToggleBtn);
      
      // Get the fresh button reference
      const btn = document.getElementById('mapToggleBtn');
      
      // Add click listener
      btn.addEventListener('click', function(e) {
        console.log('Map button clicked via addEventListener!');
        e.preventDefault();
        e.stopPropagation();
        toggleMap();
      });
      
      console.log('Map button listener attached successfully');
    } else {
      console.error('mapToggleBtn not found in DOM!');
    }

    // Create map key control button and panel
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      // Create layer toggle button (shows layers icon, switches to SAT text when satellite)
      const layerBtn = document.createElement('button');
      layerBtn.id = 'mapLayerBtn';
      layerBtn.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
          <path d="M 13 1.188 L 2.094 6.688 L 13 12.219 L 23.906 6.688 Z M 13 14.813 L 2.094 9.313 L 2 19.688 L 13 25.219 L 24 19.688 L 23.906 9.313 Z" fill="currentColor"/>
        </svg>
      `;
      layerBtn.onclick = toggleMapLayer;
      mapContainer.appendChild(layerBtn);

      // Create key toggle button (rectangular text button under layer control)
      const keyToggleBtn = document.createElement('button');
      keyToggleBtn.id = 'mapKeyToggleBtn';
      keyToggleBtn.textContent = 'KEY';
      keyToggleBtn.onclick = toggleMapKey;
      mapContainer.appendChild(keyToggleBtn);

      // Create key panel
      const keyPanel = document.createElement('div');
      keyPanel.id = 'mapKeyPanel';
      keyPanel.style.display = 'none';
      keyPanel.innerHTML = `
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">Map Legend</h3>
        <div style="margin-bottom: 12px;">
          <button id="filterObjectsBtn" class="map-filter-btn active" onclick="window.toggleMarkerFilter('objects')">
            <span class="marker-dot" style="background: #d63e2a;"></span>
            Objects
          </button>
        </div>
        <div>
          <button id="filterStickersBtn" class="map-filter-btn active" onclick="window.toggleMarkerFilter('stickers')">
            <span class="marker-dot" style="background: #2a81d6;"></span>
            Stickers
          </button>
        </div>
      `;
      mapContainer.appendChild(keyPanel);
    }

    // Add custom styles for map popup and key panel
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

      /* Custom layer button */
      #mapLayerBtn {
        position: absolute;
        top: 10px;
        right: 20px;
        width: 45px;
        height: 45px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border-radius: 0;
        border: 2px solid #000;
        background: white;
        color: #000;
        cursor: pointer;
        font-family: Helvetica, sans-serif;
        transition: background-color 0.2s, color 0.2s;
        z-index: 1001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      #mapLayerBtn:hover {
        background-color: #000;
        color: white;
      }

      #mapLayerBtn svg {
        display: block;
      }

      /* Zoom controls */
      .leaflet-control-zoom {
        border: 2px solid #000 !important;
        border-radius: 0 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      }

      .leaflet-control-zoom a {
        border-radius: 0 !important;
        border-bottom: 1px solid #000 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        color: #000 !important;
        background: white !important;
        width: 45px !important;
        height: 45px !important;
        line-height: 45px !important;
        font-size: 18px !important;
      }

      .leaflet-control-zoom a:last-child {
        border-bottom: none !important;
      }

      .leaflet-control-zoom a:hover {
        background: #000 !important;
        color: white !important;
      }

      #mapKeyToggleBtn {
        position: absolute;
        top: 65px;
        right: 20px;
        width: 45px;
        height: 45px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 0.5px;
        border-radius: 0;
        border: 2px solid #000;
        background: white;
        color: #000;
        cursor: pointer;
        font-family: Helvetica, sans-serif;
        transition: background-color 0.2s, color 0.2s;
        z-index: 1001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      #mapKeyToggleBtn:hover {
        background-color: #000;
        color: white;
      }

      #mapKeyPanel {
        position: absolute;
        top: 120px;
        right: 20px;
        background: white;
        border: 2px solid #000;
        padding: 16px;
        font-family: Helvetica, sans-serif;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        min-width: 200px;
      }
        right: 10px;
        background: white;
        border: 2px solid #000;
        padding: 16px;
        font-family: Helvetica, sans-serif;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        min-width: 200px;
      }
        right: 10px;
        background: white;
        border: 2px solid #000;
        padding: 16px;
        font-family: Helvetica, sans-serif;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        min-width: 200px;
      }

      .map-filter-btn {
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 0;
        border: 2px solid #000;
        background: white;
        color: #000;
        cursor: pointer;
        font-family: Helvetica, sans-serif;
        transition: background-color 0.2s, color 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .map-filter-btn:hover {
        background-color: #f5f5f5;
      }

      .map-filter-btn.active {
        background-color: #000;
        color: white;
      }

      .marker-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #000;
      }

      .map-filter-btn.active .marker-dot {
        border-color: white;
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
