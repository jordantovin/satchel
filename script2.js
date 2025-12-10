async function loadAllData() {
  try {
    // Show loading state
    const feed = document.getElementById("feedItems");
    if (!feed) {
      console.error('Feed element not found during initial load');
      // Retry after a short delay
      setTimeout(loadAllData, 100);
      return;
    }
    
    feed.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #7c7c7c;"><div style="font-size: 16px;">Loading posts...</div></div>';
    
    const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
      fetch(sheetURL1),
      fetch(sheetURL2),
      fetch(sheetURL3),
      fetch(sheetURL4),
      fetch(sheetURL5),
      fetch(sheetURL6),
      fetch(sheetURL7)
    ]);
    
    const [text1, text2, text3, text4, text5, text6, text7] = await Promise.all([
      res1.text(),
      res2.text(),
      res3.text(),
      res4.text(),
      res5.text(),
      res6.text(),
      res7.text()
    ]);
    
    const parsed1 = Papa.parse(text1, { header: true }).data;
    const posts1 = parsed1.filter(r => r.src && r.photo).map(p => ({
      ...p,
      collection: "collection1",
      collectionName: "Articles",
      title: p.test,
      url: p.src,
      image: p.photo,
      date: normalizeDate(p.date)
    }));

    articlesIndex = parsed1.filter(r => r.src && r.photo).map(p => ({
      ...p,
      title: p.test,
      url: p.src,
      image: p.photo,
      date: normalizeDate(p.date)
    }));

    const parsed2 = Papa.parse(text2, { header: true }).data;
    const posts2 = parsed2.filter(r => r.image).map(p => ({
      ...p,
      collection: "collection2",
      collectionName: "Field Notes",
      title: p.title || p.url,
      url: p.url,
      image: p.image,
      date: normalizeDate(p.date)
    }));

    const parsed3 = Papa.parse(text3, { header: true }).data;
    photographers = parsed3.filter(r => r['First Name'] && r['Last Name'] && r.Website).map(p => ({
      firstName: p['First Name'],
      lastName: p['Last Name'],
      name: `${p['First Name']} ${p['Last Name']}`,
      website: p.Website,
      dateAdded: normalizeDate(p['Date Added'])
    }));

    const parsed4 = Papa.parse(text4, { header: true }).data;
    stickersIndex = parsed4
      .filter(r =>
        r.src &&
        r.date &&
        r.location_overlay &&
        r.medium
      )
      .map(p => ({
        ...p,
        image: p.src,
        date: normalizeDate(p.date),
        location: p.location_overlay,
        location_card: p.location_card,
        medium: p.medium,
        artist: p.artist || 'Unknown'
      }));

    const parsed5 = Papa.parse(text5, { header: true }).data;

    objectsIndex = parsed5
      .filter(r => r.Date && r.Text && r.Image)
      .map(o => ({
        date: normalizeDate(o.Date),
        text: o.Text,
        image: o.Image
      }));

    const posts5 = parsed5
      .filter(r => r.Date && r.Text && r.Image)
      .map(o => ({
        collection: "objects",
        collectionName: "Objects",
        title: o.Text,
        date: normalizeDate(o.Date),
        url: o.Image,
        image: o.Image,
        text: o.Text
      }));

    const parsed6 = Papa.parse(text6, { header: true }).data;

    jordanPosts = parsed6
      .filter(r => r.Date && r.Title)
      .map(p => {
        const hasImage = p.Image && p.Image.trim() !== "";
        const hasLink = p.Link && p.Link.trim() !== "";

        return {
          collection: "jordan",
          collectionName: "Jordan",
          title: p.Title,
          date: normalizeDate(p.Date),
          text: p.Text || "",
          image: hasImage ? p.Image : "",
          url: hasLink ? p.Link : (hasImage ? p.Image : "#")
        };
      });

    const posts4 = parsed4
      .filter(r => 
        r.src &&
        r.date &&
        r.location_card &&
        r.medium &&
        r.feed &&
        r.feed.trim().toLowerCase() === "yes"
      )
      .map(p => ({
        ...p,
        collection: "collection4",
        collectionName: "Stickers",
        title: p.location_card || 'Sticker',
        date: normalizeDate(p.date),
        url: p.src,
        image: p.src,
        medium: p.medium,
        location: p.location_card,
        artist: p.artist
      }));

    const parsed7 = Papa.parse(text7, { header: true, skipEmptyLines: true }).data;
    
    console.log('Parsed CSV data:', parsed7);
    console.log('First row:', parsed7[0]);
    console.log('Column headers:', Object.keys(parsed7[0] || {}));
    
    // Photos Index - all entries with Link and Photographer
    // Being flexible with column names (handling potential whitespace or case issues)
    photosIndex = parsed7
      .filter(r => {
        const link = r.Link || r.link || '';
        const photographer = r.Photographer || r.photographer || '';
        return link.trim() !== '' && photographer.trim() !== '';
      })
      .map(p => {
        const link = (p.Link || p.link || '').trim();
        const photographer = (p.Photographer || p.photographer || '').trim();
        const note = (p.Note || p.note || '').trim();
        const date = (p.Date || p.date || '').trim();
        
        return {
          link: link,
          photographer: photographer,
          note: note,
          date: date ? normalizeDate(date) : ''
        };
      });

    console.log('Photos Index:', photosIndex);
    console.log('Photos Index length:', photosIndex.length);

    // Photos for feed - only entries with dates
    const photosPosts = parsed7
      .filter(r => {
        const link = r.Link || r.link || '';
        const photographer = r.Photographer || r.photographer || '';
        const date = r.Date || r.date || '';
        return link.trim() !== '' && photographer.trim() !== '' && date.trim() !== '';
      })
      .map(p => {
        const link = (p.Link || p.link || '').trim();
        const photographer = (p.Photographer || p.photographer || '').trim();
        const note = (p.Note || p.note || '').trim();
        const date = (p.Date || p.date || '').trim();
        
        return {
          collection: "photos",
          collectionName: "Photos",
          title: photographer,
          date: normalizeDate(date),
          url: link,
          image: link,
          text: note
        };
      });

    console.log('Photos Posts:', photosPosts);
    console.log('Photos Posts length:', photosPosts.length);

    allPosts = [ ...posts1, ...posts2, ...posts4, ...posts5, ...jordanPosts, ...photosPosts ];
    
    console.log('Total posts loaded:', allPosts.length);
    
    document.getElementById('countAll').textContent = allPosts.length;
    document.getElementById('count1').textContent = posts1.length;
    document.getElementById('count2').textContent = posts2.length;
    document.getElementById('count3').textContent = photographers.length;
    document.getElementById('count4').textContent = posts4.length;
    document.getElementById('countStickersIndex').textContent = stickersIndex.length;
    document.getElementById('countArticlesIndex').textContent = articlesIndex.length;
    document.getElementById("countObjects").textContent = posts5.length;
    document.getElementById("countObjectsIndex").textContent = objectsIndex.length;
    document.getElementById("countPhotos").textContent = photosPosts.length;
    document.getElementById("countPhotosIndex").textContent = photosIndex.length;
    document.getElementById("countPicturesIndex").textContent = photosIndex.length;

    updateHistory();
    document.getElementById('countSaved').textContent = savedPosts.length;

    // Ensure we're in feed view
    currentView = "feed";
    currentFilter = "all";
    
    // Initialize Lucide icons before rendering
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
    
    // Force immediate render
    console.log('Calling render() with', allPosts.length, 'posts');
    render();
    
    // Double-check render happened
    setTimeout(() => {
      const feedCheck = document.getElementById("feedItems");
      if (feedCheck && feedCheck.children.length === 0) {
        console.warn('Feed is empty after render, retrying...');
        render();
      }
    }, 100);
    
  } catch (error) {
    console.error("Error loading data:", error);
    const feed = document.getElementById("feedItems");
    if (feed) {
      feed.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #7c7c7c;"><div style="font-size: 16px;">Retrying...</div></div>';
    }
    // Retry after 2 seconds
    setTimeout(loadAllData, 2000);
  }
}
