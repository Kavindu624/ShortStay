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

// Extension alone is just a filename the client chose — check it AND the
// declared MIME type agree on "this is actually a jpeg/png", as defense in
// depth against a non-image file being renamed to a trusted-looking extension.
const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png/;
  const extOk  = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /^image\/(jpeg|png)$/.test(file.mimetype);

  if (extOk && mimeOk) {
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