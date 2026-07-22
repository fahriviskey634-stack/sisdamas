const fs = require('fs');
const path = require('path');

async function searchOverpass() {
  console.log("Querying Overpass API for Sukahaji in Cipeundeuy / Bandung Barat...");
  
  // Overpass QL query to search for relation/way named Sukahaji in West Java
  const query = `
    [out:json][timeout:25];
    (
      relation["name"="Sukahaji"]["admin_level"="7"];
      relation["name"="Sukahaji"]["admin_level"="8"];
      relation["name"="Sukahaji"]["admin_level"="9"];
      way["name"="Sukahaji"];
    );
    out body;
    >;
    out skel pc;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query)
    });
    const data = await res.json();
    console.log("Overpass elements count:", data.elements?.length);
    
    // Find relation with admin_level 7, 8 or 9 in Cipeundeuy/Bandung Barat area (around lat -6.72)
    if (data.elements) {
      const nodes = new Map();
      data.elements.filter(e => e.type === 'node').forEach(n => nodes.set(n.id, [n.lon, n.lat]));
      
      const ways = data.elements.filter(e => e.type === 'way');
      console.log("Found ways count:", ways.length);
      
      for (const way of ways) {
        if (way.nodes && way.nodes.length > 5) {
          const coords = way.nodes.map(id => nodes.get(id)).filter(Boolean);
          if (coords.length > 5) {
            // Check if coordinates match Bandung Barat region (-6.75 to -6.65, 107.30 to 107.45)
            const firstLat = coords[0][1];
            const firstLon = coords[0][0];
            if (firstLat < -6.65 && firstLat > -6.80 && firstLon > 107.30 && firstLon < 107.45) {
              console.log("Found matching boundary way in Sukahaji area!", coords.length, "points");
              const feature = {
                type: "Feature",
                properties: {
                  name: "Desa Sukahaji",
                  kecamatan: "Cipeundeuy",
                  kabupaten: "Bandung Barat"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [coords]
                }
              };
              const targetPath = path.join(process.cwd(), 'public', 'data', 'sukahaji_boundary.json');
              fs.writeFileSync(targetPath, JSON.stringify(feature, null, 2));
              console.log("Saved exact boundary to:", targetPath);
              return true;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Overpass query error:", err);
  }

  return false;
}

searchOverpass();
