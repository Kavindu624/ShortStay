/**
 * Seed script — creates dummy property listings with images.
 * Run with: node seed_properties.js
 *
 * Uses Unsplash source URLs (no API key needed) for property images.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('./models/index');
const { User } = require('./models/index');

// ── Realistic Unsplash property images (stable direct image URLs) ─────────────
const IMG = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&auto=format&fit=crop',
  ],
  room: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
  ],
  bungalow: [
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop',
  ],
  cabin: [
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&auto=format&fit=crop',
  ],
};

// ── Dummy property data ───────────────────────────────────────────────────────
const PROPERTIES = [
  // Colombo
  {
    title: 'Modern Studio in Colombo 7',
    description: 'A beautifully furnished studio apartment in the heart of Colombo. Walking distance to major offices, restaurants, and the Viharamahadevi Park. Features high-speed WiFi, air conditioning, and a fully equipped kitchen.',
    address: '45 Gregory\'s Road, Colombo 07, Sri Lanka',
    price_per_night: 4500,
    max_guests: 2,
    bedrooms: 1,
    property_type: 'apartment',
    latitude: 6.9006,
    longitude: 79.8638,
    amenities: 'WiFi, Air Conditioning, Kitchen, TV, Washing Machine',
  },
  {
    title: 'Luxury Penthouse with City Views',
    description: 'Stunning penthouse apartment on the 18th floor with panoramic views of Colombo. Fully furnished with premium furniture, infinity pool access, and concierge service. Perfect for business travellers and long stays.',
    address: '1 Justice Akbar Mawatha, Colombo 02, Sri Lanka',
    price_per_night: 18500,
    max_guests: 4,
    bedrooms: 3,
    property_type: 'apartment',
    latitude: 6.9271,
    longitude: 79.8612,
    amenities: 'Pool, WiFi, Gym, Parking, Air Conditioning, Balcony, Concierge',
  },
  {
    title: 'Cozy Apartment near Galle Face',
    description: 'Comfortable 2-bedroom apartment just 5 minutes walk from the iconic Galle Face Green. Enjoy sea breezes from the balcony and explore the best of Colombo\'s dining and nightlife scene.',
    address: '18 Galle Road, Colombo 03, Sri Lanka',
    price_per_night: 7200,
    max_guests: 3,
    bedrooms: 2,
    property_type: 'apartment',
    latitude: 6.9195,
    longitude: 79.8466,
    amenities: 'WiFi, Air Conditioning, Balcony, Kitchen, TV',
  },

  // Galle / South Coast
  {
    title: 'Heritage Villa inside Galle Fort',
    description: 'Step back in time in this beautifully restored 200-year-old Dutch colonial villa inside the UNESCO World Heritage Galle Fort. Original tile floors, wooden beam ceilings, and private courtyard garden.',
    address: 'Church Street, Galle Fort, Galle, Sri Lanka',
    price_per_night: 22000,
    max_guests: 6,
    bedrooms: 4,
    property_type: 'villa',
    latitude: 6.0264,
    longitude: 80.2170,
    amenities: 'WiFi, Pool, Garden, Kitchen, Parking, Air Conditioning, Historic',
  },
  {
    title: 'Beachfront Bungalow in Unawatuna',
    description: 'Wake up to the sound of waves at this charming beachfront bungalow in Unawatuna. Private beach access, hammock terrace, outdoor shower, and stunning sunset views over the Indian Ocean.',
    address: 'Unawatuna Beach, Galle, Sri Lanka',
    price_per_night: 9500,
    max_guests: 4,
    bedrooms: 2,
    property_type: 'bungalow',
    latitude: 6.0139,
    longitude: 80.2493,
    amenities: 'Beach Access, WiFi, Air Conditioning, Terrace, Outdoor Shower',
  },
  {
    title: 'Mirissa Surf Shack & Studio',
    description: 'Chilled-out studio a 2-minute stroll from Mirissa Beach. Ideal for surfers and backpackers. Surfboard storage, outdoor area for drying, bike hire available. Close to whale-watching boats.',
    address: 'Mirissa Beach Road, Mirissa, Sri Lanka',
    price_per_night: 3200,
    max_guests: 2,
    bedrooms: 1,
    property_type: 'room',
    latitude: 5.9481,
    longitude: 80.4543,
    amenities: 'WiFi, Surfboard Storage, Outdoor Area, Bike Rental',
  },

  // Kandy / Hills
  {
    title: 'Colonial Tea Estate House — Kandy Hills',
    description: 'Romantic colonial-era house set in a working tea estate with breathtaking views of misty mountains. Features a wrap-around veranda, wood-burning fireplace, and butler service. Ideal for couples.',
    address: 'Hantana Road, Kandy, Sri Lanka',
    price_per_night: 15000,
    max_guests: 4,
    bedrooms: 3,
    property_type: 'house',
    latitude: 7.2906,
    longitude: 80.6337,
    amenities: 'WiFi, Fireplace, Garden, Butler Service, Mountain View, Parking',
  },
  {
    title: 'Boutique Room with Lake View',
    description: 'Comfortable private room in a guesthouse overlooking the scenic Kandy Lake. Short walk to the Temple of the Tooth Relic. Breakfast included, homely atmosphere, perfect for solo travellers.',
    address: 'Sangaraja Mawatha, Kandy, Sri Lanka',
    price_per_night: 3800,
    max_guests: 2,
    bedrooms: 1,
    property_type: 'room',
    latitude: 7.2926,
    longitude: 80.6413,
    amenities: 'WiFi, Breakfast, Lake View, Air Conditioning',
  },
  {
    title: 'Ella Mountain Cabin Retreat',
    description: 'Remote off-grid cabin perched at 1,500m with unobstructed views of Ella Rock and the Little Adam\'s Peak. Solar power, rainwater harvesting, organic garden. A true escape from city life.',
    address: 'Ella Village, Badulla District, Sri Lanka',
    price_per_night: 6500,
    max_guests: 3,
    bedrooms: 1,
    property_type: 'cabin',
    latitude: 6.8667,
    longitude: 81.0466,
    amenities: 'Mountain View, Organic Garden, Solar Power, Hiking Access',
  },

  // Negombo / Airport
  {
    title: 'Airport Transit Apartment — Negombo',
    description: 'Stress-free transit accommodation just 10 minutes from Bandaranaike International Airport. Free airport transfers, late check-out, blackout curtains, and luggage storage. 24/7 reception.',
    address: 'Lewis Place, Negombo, Sri Lanka',
    price_per_night: 5500,
    max_guests: 3,
    bedrooms: 2,
    property_type: 'apartment',
    latitude: 7.2094,
    longitude: 79.8403,
    amenities: 'Free Airport Transfer, WiFi, Air Conditioning, 24/7 Reception, Parking',
  },
  {
    title: 'Negombo Beach House',
    description: 'Family-friendly 4-bedroom beach house with a private pool and barbecue area on Negombo Beach. Spacious living areas, full kitchen, bike rentals, and easy access to the famous Negombo fish market.',
    address: 'Poruthota Road, Negombo, Sri Lanka',
    price_per_night: 12500,
    max_guests: 8,
    bedrooms: 4,
    property_type: 'house',
    latitude: 7.2113,
    longitude: 79.8324,
    amenities: 'Pool, BBQ, WiFi, Parking, Beach Access, Kitchen, Bikes',
  },

  // Sigiriya / Cultural Triangle
  {
    title: 'Eco-Lodge near Sigiriya Rock',
    description: 'Immersive eco-lodge surrounded by jungle with views of the iconic Sigiriya Rock Fortress. Open-air bathrooms, nature walks, birdwatching tours, and evening campfires. UNESCO World Heritage Site steps away.',
    address: 'Sigiriya Village, Matale District, Sri Lanka',
    price_per_night: 8800,
    max_guests: 2,
    bedrooms: 1,
    property_type: 'bungalow',
    latitude: 7.9568,
    longitude: 80.7603,
    amenities: 'Nature Walks, Birdwatching, Open-Air Bathroom, Campfire, WiFi',
  },

  // Trincomalee / East Coast
  {
    title: 'Nilaveli Beach Villa',
    description: 'Stunning beachfront villa on the pristine shores of Nilaveli — one of Sri Lanka\'s most beautiful beaches. Private beach, infinity pool, outdoor dining pavilion. Close to Pigeon Island National Park.',
    address: 'Nilaveli Beach, Trincomalee, Sri Lanka',
    price_per_night: 25000,
    max_guests: 8,
    bedrooms: 4,
    property_type: 'villa',
    latitude: 8.7108,
    longitude: 81.1978,
    amenities: 'Private Beach, Infinity Pool, WiFi, Outdoor Dining, AC, Snorkeling',
  },
];

// ── Helper: pick images for a property type ──────────────────────────────────
function getImages(type) {
  return IMG[type] || IMG.apartment;
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected\n');

    // Get all host users
    const [hosts] = await sequelize.query(
      `SELECT u.user_id, u.name FROM user u WHERE u.role = 'host' LIMIT 20`
    );

    if (hosts.length === 0) {
      // Create a dummy host if none exist
      console.log('No hosts found — creating a demo host...');
      const hashed = await bcrypt.hash('Host@123', 10);
      const { User } = require('./models/index');
      const demoHost = await User.create({
        name: 'Demo Host',
        email: 'host@shortstay.com',
        password: hashed,
        role: 'host',
        is_verified: true,
        phone: '+94771234567',
      });
      await sequelize.query(
        'INSERT INTO host (user_id, bank_details) VALUES (?, ?)',
        { replacements: [demoHost.user_id, 'Bank of Ceylon | 0012345678'] }
      );
      hosts.push({ user_id: demoHost.user_id, name: demoHost.name });
      console.log(`✓ Created demo host: host@shortstay.com (password: Host@123)\n`);
    }

    console.log(`Found ${hosts.length} host(s). Seeding ${PROPERTIES.length} properties...\n`);

    let created = 0;
    for (let i = 0; i < PROPERTIES.length; i++) {
      const prop = PROPERTIES[i];
      const host = hosts[i % hosts.length]; // rotate through hosts
      const images = getImages(prop.property_type);

      // Insert property
      const [result] = await sequelize.query(
        `INSERT INTO property 
          (host_id, title, description, address, price_per_night, max_guests, bedrooms,
           property_type, latitude, longitude, is_approved, verification_badge,
           verification_status, overall_score, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'approved', ?, ?)`,
        {
          replacements: [
            host.user_id,
            prop.title,
            prop.description,
            prop.address,
            prop.price_per_night,
            prop.max_guests,
            prop.bedrooms,
            prop.property_type,
            prop.latitude,
            prop.longitude,
            (Math.random() * 1.5 + 3.5).toFixed(2), // rating between 3.5 and 5.0
            images[0], // primary image stored on property row
          ],
        }
      );

      const property_id = result;

      // Insert 3 images into property_images
      for (let j = 0; j < images.length; j++) {
        await sequelize.query(
          `INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)`,
          { replacements: [property_id, images[j], j === 0 ? 1 : 0] }
        );
      }

      console.log(`  ✓ [${i + 1}/${PROPERTIES.length}] "${prop.title}" → host: ${host.name}`);
      created++;
    }

    console.log(`\n✅ Done! Created ${created} property listings.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

seed();
