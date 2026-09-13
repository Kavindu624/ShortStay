const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = 'uploads/inspections';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // inspection_id comes from the URL — never trust it into a filename unvalidated
    // (an unsanitized value here is a path-traversal / arbitrary-file-write vector).
    const inspectionId = parseInt(req.params.inspection_id, 10);
    if (!Number.isInteger(inspectionId) || inspectionId <= 0) {
      return cb(new Error('Invalid inspection id'));
    }
    const unique = `inspection_${inspectionId}_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

// Extension alone is just a filename the client chose — check it AND the
// declared MIME type agree on "this is actually a jpeg/png", as defense in
// depth against a non-image file being renamed to a trusted-looking extension.
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const extOk  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /^image\/(jpeg|png)$/.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png images allowed'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
