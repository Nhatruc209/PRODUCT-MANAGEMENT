const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads/products"));
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extname).replace(/\s+/g, "-");
        cb(null, `${Date.now()}-${basename}${extname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
    }

    cb(new Error("Chi duoc upload file hinh anh!"));
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
