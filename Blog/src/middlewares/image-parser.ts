import { Request } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';

const customFileStorage: StorageEngine = multer.diskStorage({
  destination: (_, _1, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_, file, cb) => {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`
    );
  }
});

const customFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export default multer({
  storage: customFileStorage,
  fileFilter: customFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
