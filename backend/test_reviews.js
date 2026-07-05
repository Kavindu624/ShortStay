const { Review, Booking, Property } = require('./models/index');

async function run() {
  const reviews = await Review.findAll({
    include: [{
      model: Booking,
      include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }]
    }],
    order: [['review_id', 'DESC']],
  });
  
  if (reviews.length > 0) {
    const r = reviews[0].get({ plain: true });
    console.log("Review payload:", JSON.stringify(r, null, 2));
  } else {
    console.log("No reviews.");
  }
  process.exit(0);
}

run();
