const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

s.query('SELECT p.property_id, p.title, p.image, (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.property_id ORDER BY pi.image_id LIMIT 1) as first_image FROM property p')
  .then(([r]) => {
    console.log(JSON.stringify(r, null, 2));
    s.close();
  });
