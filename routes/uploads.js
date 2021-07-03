const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");

const {Storage} = require("@google-cloud/storage");
const storage = new Storage();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

router.route("/").post(auth, upload.single("image"), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({"error": "brak pliku"});
    }

    const blob = bucket.file(Date.now() + path.extname(req.file.originalname));
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    blobStream.on("error", err => {
        next(err);
    });

    blobStream.on("finish", () => {
        res.json(blob.name);
    });

    blobStream.end(req.file.buffer);
});

router.route("/:filename").delete(auth, async (req, res) => {
    await bucket.file(req.params.filename).delete();
    res.json(true);
});

module.exports = router;