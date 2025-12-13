// Overlay/Lightbox functionality

function showOverlay(index) {
  currentImageIndex = index;
  const img = filteredImages[index];
  
  // Skip overlay for articles
  if (img.type === 'articles') return;
  
  document.getElementById("overlayImg").src = img.src;
  document.getElementById("overlay").style.display = "flex";
  
  let overlayHTML = `<strong>Date:</strong> ${img.date}<br>`;
  
  if (img.source === "Americanisms") {
    overlayHTML += `<strong>Location:</strong><br>${img.location_overlay.replace(/\n/g, "<br>")}<br>`;
    overlayHTML += `<strong>Medium:</strong> ${img.medium}<br>`;
    if (img.artist) overlayHTML += `<strong>Artist:</strong> ${img.artist}`;
  } else if (img.source === "Objects") {
    overlayHTML += `<strong>Title:</strong> ${img.title}<br>`;
    if (img.note) overlayHTML += `<strong>Note:</strong> ${img.note}`;
  } else if (img.type === "pictures") {
    overlayHTML += `<strong>Photographer:</strong> ${img.photographer}<br>`;
    if (img.note) overlayHTML += `<strong>Note:</strong> ${img.note}`;
  }
  
  document.getElementById("overlayMetadata").innerHTML = overlayHTML;
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("overlayImg").src = "";
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

async function toggleFullscreen() {
  const overlay = document.getElementById("overlay");
  
  try {
    if (!document.fullscreenElement) {
      await overlay.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.log('Fullscreen error:', err);
    alert('Fullscreen failed. Try pressing F11 or use the F key.');
  }
}
