// Data loading and parsing
async function loadAllData() {
  try {
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
    
    // Parse Articles (Collection 1)
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

    // Parse Field Notes (Collection 2)
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

    // Parse Photographers
    const parsed3 = Papa.parse(text3, { header: true }).data;
    photographers = parsed3.filter(r => r['First Name'] && r['Last Name'] && r.Website).map(p => ({
      firstName: p['First Name'],
      lastName: p['Last Name'],
      name: `${p['First Name']} ${p['Last Name']}`,
      website: p.Website,
      type: p.Type || '',
      class: p.Class || '',
      why: p.Why || '',
      what: p.What || '',
      location: p.Location || '',
      dateAdded: normalizeDate(p['Date Added'])
    }));

    // Parse Stickers (Collection 4)
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

    // Parse Objects (Collection 5) - UPDATED TO USE Title AND Note
    const parsed5 = Papa.parse(text5, { header: true }).data;

    objectsIndex = parsed5
      .filter(r => r.Date && r.Title && r.Image)
      .map(o => ({
        date: normalizeDate(o.Date),
        title: o.Title,
        note: o.Note || '',
        image: o.Image
      }));

    const posts5 = parsed5
      .filter(r => r.Date && r.Title && r.Image)
      .map(o => ({
        collection: "objects",
        collectionName: "Objects",
        title: o.Title,
        date: normalizeDate(o.Date),
        url: o.Image,
        image: o.Image,
        text: o.Note || '',
        note: o.Note || ''
      }));

    // Parse Jordan Posts
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

    // Filter stickers for feed
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

    // Parse Photos (Collection 7)
    const parsed7 = Papa.parse(text7, { header: true }).data;

    photosIndex = parsed7
      .filter(r => r.Link && r.Photographer)
      .map(p => ({
        link: p.Link,
        photographer: p.Photographer,
        note: p.Note || '',
        date: normalizeDate(p.Date)
      }));

    const posts7 = parsed7
      .filter(r => r.Link && r.Photographer)
      .map(p => ({
        collection: "photos",
        collectionName: "Photos",
        title: p.Photographer,
        date: normalizeDate(p.Date),
        url: p.Link,
        image: p.Link,
        text: p.Note || '',
        photographer: p.Photographer
      }));

    // Combine all posts
    allPosts = [ ...posts1, ...posts2, ...posts4, ...posts5, ...jordanPosts, ...posts7 ];
    
    console.log('Data loaded:', {
      articles: posts1.length,
      fieldNotes: posts2.length,
      stickers: posts4.length,
      objects: posts5.length,
      jordan: jordanPosts.length,
      photos: posts7.length,
      total: allPosts.length
    });
    
    // Update counts
    document.getElementById('countAll').textContent = allPosts.length;
    document.getElementById('count1').textContent = posts1.length;
    document.getElementById('count2').textContent = posts2.length;
    document.getElementById('count3').textContent = photographers.length;
    document.getElementById('count4').textContent = posts4.length;
    document.getElementById('countStickersIndex').textContent = stickersIndex.length;
    document.getElementById('countArticlesIndex').textContent = articlesIndex.length;
    document.getElementById("countObjects").textContent = posts5.length;
    document.getElementById("countObjectsIndex").textContent = objectsIndex.length;
    document.getElementById("countPhotos").textContent = posts7.length;
    document.getElementById("countPhotosIndex").textContent = photosIndex.length;

    updateHistory();
    document.getElementById('countSaved').textContent = savedPosts.length;

    // Ensure "All Posts" is active on initial load
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const allPostsNav = document.querySelector('.nav-item[data-filter="all"]');
    if (allPostsNav) {
      allPostsNav.classList.add('active');
    }

    lucide.createIcons();
    render();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}
