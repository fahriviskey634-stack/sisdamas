const fs = require('fs');
const path = require('path');

async function searchSukahajiList() {
  const url = "https://nominatim.openstreetmap.org/search?q=Sukahaji+Cipeundeuy&format=json&polygon_geojson=1&addressdetails=1";
  const res = await fetch(url, { headers: { 'User-Agent': 'KKN56-App/1.0' } });
  const data = await res.json();
  console.log("Results for Sukahaji Cipeundeuy:", data.length);
  data.forEach((item, idx) => {
    console.log(`\n[${idx+1}] ${item.display_name}`);
    console.log(`Lat: ${item.lat}, Lon: ${item.lon}`);
    console.log(`Type: ${item.type}, Class: ${item.class}`);
    console.log(`GeoJSON Type: ${item.geojson?.type}`);
    if (item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')) {
      console.log(`Coordinates count: ${item.geojson.coordinates.length}`);
    }
  });

  // Search by bbox in Bandung Barat
  console.log("\n--- Searching in Bounding Box of Cipeundeuy Bandung Barat (-6.8 to -6.6, 107.3 to 107.5) ---");
  const bboxUrl = "https://nominatim.openstreetmap.org/search?q=Sukahaji&viewbox=107.30,-6.65,107.45,-6.80&bounded=1&format=json&polygon_geojson=1";
  const bboxRes = await fetch(bboxUrl, { headers: { 'User-Agent': 'KKN56-App/1.0' } });
  const bboxData = await bboxRes.json();
  console.log("BBox Results count:", bboxData.length);
  bboxData.forEach((item, idx) => {
    console.log(`\n[BBOX ${idx+1}] ${item.display_name}`);
    console.log(`Lat: ${item.lat}, Lon: ${item.lon}`);
    console.log(`GeoJSON Type: ${item.geojson?.type}`);
    if (item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')) {
      const feature = {
        type: "Feature",
        properties: {
          name: "Desa Sukahaji",
          display_name: item.display_name,
          kecamatan: "Cipeundeuy",
          kabupaten: "Bandung Barat"
        },
        geometry: item.geojson
      };
      const targetPath = path.join(process.cwd(), 'public', 'data', 'sukahaji_boundary.json');
      fs.writeFileSync(targetPath, JSON.stringify(feature, null, 2));
      console.log("SAVED GeoJSON polygon from Bbox result to:", targetPath);
    }
  });
}

searchSukahajiList().catch(console.error);
