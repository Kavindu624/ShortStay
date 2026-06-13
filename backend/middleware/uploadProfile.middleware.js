const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Create profiles upload folder if not exists
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // filename = user_id + timestamp + extension
    cb(null, `profile_${req.user.user_id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png images allowed'));
  }
};

const uploadProfile = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});

module.exports = uploadProfile;