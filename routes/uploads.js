const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({storage: storage});

router.route("/").post(auth, upload.single("image"), (req, res) => {
    return res.json(req.file.filename);
});

router.route("/:filename").delete(auth, (req, res) => {
    fs.unlink("uploads/" + req.params.filename, err => {
        err ? res.status(400).json(err) : res.json(true);
    });
});

module.exports = router;