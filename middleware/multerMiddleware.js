// middleware/multer.js
import multer from "multer";
// console.log(typeof multer);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files get saved temporarily
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // avoid name collisions
  },
});

const upload = multer({ storage });

export default upload;