import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDir = path.resolve(process.cwd(), 'uploads', 'protocols');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^\w.\-()а-яА-ЯёЁ ]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

export const protocolUpload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});