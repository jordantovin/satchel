function sortPosts(arr) {
  let sorted = [...arr];
  
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    
    const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = parseInt(slashMatch[1], 10) - 1;
      const day = parseInt(slashMatch[2], 10);
      const year = parseInt(slashMatch[3], 10);
      return new Date(year, month, day);
    }
    
    return new Date(dateStr);
  };
  
  if (currentSort === "date-oldest") {
    sorted.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  } else if (currentSort === "date-newest") {
    sorted.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  } else if (currentSort === "title-az") {
    sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (currentSort === "title-za") {
    sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  } else if (currentSort === "shuffle") {
    const stickers = sorted.filter(p => p.collection === 'collection4');
    const otherPosts = sorted.filter(p => p.collection !== 'collection4');
    
    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    const limitedStickers = shuffleArray([...stickers]).slice(0, Math.floor(Math.random() * 4) + 5);
    
    sorted = shuffleArray([...otherPosts, ...limitedStickers]);
  }
  
  return sorted;
}

function filterPosts(arr) {
  let filtered = arr;
  
  if (currentFilter === "saved") {
    filtered = filtered.filter(p => savedPosts.includes(p.url));
  } else if (currentFilter !== "all") {
    filtered = filtered.filter(p => p.collection === currentFilter);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    
    filtered = filtered.filter(post => {
      return Object.values(post).some(value => {
        return value && typeof value === 'string' && value.toLowerCase().includes(query);
      });
    });
    
    if (currentFilter === "all") {
      const matchingPhotographers = photographers.filter(p => {
        return p.name.toLowerCase().includes(query) || 
               p.firstName.toLowerCase().includes(query) ||
               p.lastName.toLowerCase().includes(query) ||
               p.website.toLowerCase().includes(query);
      }).map(p => ({
        collection: "photographer",
        collectionName: "Photographers",
        title: p.name,
        url: p.website,
        image: '',
        date: p.dateAdded,
        noImage: true
      }));
      
      const matchingStickers = stickersIndex.filter(s => {
        return Object.values(s).some(value => {
          return value && typeof value === 'string' && value.toLowerCase().includes(query);
        });
      }).map(s => ({
        collection: "collection4",
        collectionName: "Stickers",
        title: s.location || 'Sticker',
        url: s.image,
        image: s.image,
        date: s.date,
        medium: s.medium,
        location: s.location,
        artist: s.artist
      }));
      
      filtered = [...filtered, ...matchingPhotographers, ...matchingStickers];
    }
  }
  
  return filtered;
}

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

    const parsed7 = Papa.parse(text7, { header: true }).data;
    
    picturesIndex = parsed7
      .filter(r => r.Link && r.Photographer)
      .map(p => ({
        link: p.Link,
        photographer: p.Photographer
      }));

    photosIndex = parsed7
      .filter(r => r.Image && r.Date)
      .map(p => ({
        image: p.Image,
        date: normalizeDate(p.Date),
        title: p.Title || 'Photo',
        location: p.Location || '',
        notes: p.Notes || ''
      }));

    const posts7 = parsed7
      .filter(r => r.Image && r.Date && r.Feed && r.Feed.trim().toLowerCase() === "yes")
      .map(p => ({
        collection: "photos",
        collectionName: "Photos",
        title: p.Title || 'Photo',
        date: normalizeDate(p.Date),
        url: p.Image,
        image: p.Image,
        location: p.Location || '',
        notes: p.Notes || ''
      }));

    allPosts = [ ...posts1, ...posts2, ...posts4, ...posts5, ...jordanPosts, ...posts7 ];
    
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
    document.getElementById("countPicturesIndex").textContent = picturesIndex.length;

    updateHistory();
    document.getElementById('countSaved').textContent = savedPosts.length;

    lucide.createIcons();
    render();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}
