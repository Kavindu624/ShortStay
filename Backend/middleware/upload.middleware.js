const multer = require('multer');
const path = require('path');

// Where to save the file and what to name it
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // filename = current timestamp + original extension
    // example: 1714123456789.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);  // accept file
  } else {
    cb(new Error('Only jpg, jpeg, png images are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});

module.exports = upload;