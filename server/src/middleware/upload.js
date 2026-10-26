import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe alphanumeric timestamped filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeExt = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBase}-${uniqueSuffix}${safeExt}`);
  }
});

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Images, DOC, DOCX, XLS, and TXT files are accepted.'), false);
  }
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

export const upload = multer({
  storage,
  limits: { fileSize: maxSizeBytes },
  fileFilter
});
