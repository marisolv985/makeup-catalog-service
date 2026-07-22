const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

function deleteUploadedImages(imagePaths) {
  if (!imagePaths || !Array.isArray(imagePaths)) return;
  imagePaths.forEach((imgPath) => {
    if (imgPath && imgPath.startsWith('/uploads/')) {
      const fullPath = path.join(UPLOADS_DIR, path.basename(imgPath));
      fs.unlink(fullPath, () => {});
    }
  });
}

module.exports = { deleteUploadedImages };
