require('dotenv').config();
const { Sequelize } = require('sequelize');

const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

// Beautiful Unsplash stock photos mapped by property type (3 photos each)
const PHOTO_SETS = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
  ],
  room: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1616627988630-38c4d7c6f4b6?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  ],
  bungalow: [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
    'https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&q=80',
    'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
  ],
  cabin: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
    'https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800&q=80',
  ],
};

// Interior photos for secondary images
const INTERIOR_PHOTOS = {
  apartment: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80',
    'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800&q=80',
    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80',
    'https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&q=80',
  ],
  room: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'https://images.unsplash.com/photo-1512916194211-3f2b7f5f7f1a?w=800&q=80',
  ],
  bungalow: [
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  cabin: [
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
  ],
};

function pickPhoto(arr, propertyId, offset = 0) {
  return arr[(propertyId + offset) % arr.length];
}

async function run() {
  try {
    await s.authenticate();
    console.log('Connected to database');

    const [properties] = await s.query('SELECT property_id, property_type FROM property ORDER BY property_id');
    console.log(`Found ${properties.length} properties`);

    let inserted = 0;
    for (const prop of properties) {
      const type = prop.property_type || 'apartment';
      const pid = prop.property_id;

      // Check existing images
      const [existing] = await s.query(
        'SELECT image_id, is_primary FROM property_images WHERE property_id = ?',
        { replacements: [pid] }
      );

      const hasPrimary = existing.some(i => i.is_primary);

      // Pick 4 images: 1 exterior (primary) + 3 interior
      const exteriorPhotos = PHOTO_SETS[type] || PHOTO_SETS.apartment;
      const interiorPhotos = INTERIOR_PHOTOS[type] || INTERIOR_PHOTOS.apartment;

      const toInsert = [];

      if (!hasPrimary) {
        // Add primary exterior photo
        toInsert.push({
          url: pickPhoto(exteriorPhotos, pid, 0),
          is_primary: 1,
        });
      }

      // Add up to 3 interior secondary photos (skip if already have >= 3 total)
      const needed = Math.max(0, 4 - existing.length - toInsert.length);
      for (let i = 0; i < needed; i++) {
        toInsert.push({
          url: pickPhoto(interiorPhotos, pid, i),
          is_primary: 0,
        });
      }

      // Also add 1 more exterior secondary if we still have room
      if (toInsert.length < 4 - existing.length && existing.length < 4) {
        toInsert.push({
          url: pickPhoto(exteriorPhotos, pid, 1),
          is_primary: 0,
        });
      }

      for (const img of toInsert) {
        await s.query(
          'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
          { replacements: [pid, img.url, img.is_primary] }
        );
        inserted++;
      }
    }

    console.log(`✅ Done! Inserted ${inserted} new property images.`);
    await s.close();
  } catch (err) {
    console.error('Error:', err.message);
    await s.close();
    process.exit(1);
  }
}

run();
