const { Property, Review } = require('./backend/models/index');

async function test() {
  const properties = await Property.findAll({
    where: { title: "Tamba's palace" },
    include: [{ model: Review, attributes: ['review_id'], required: false }]
  });
  console.log(JSON.stringify(properties, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
