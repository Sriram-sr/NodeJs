import { Request } from 'express';
import multer, { diskStorage, StorageEngine, FileFilterCallback } from 'multer';

const customFileStorage: StorageEngine = diskStorage({
  destination: (
    _: Request,
    _1: Express.Multer.File,
    cb: (error: Error | null, dest: string) => void
  ) => {
    cb(null, 'uploads/');
  },
  filename: (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, dest: string) => void
  ) => {
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
