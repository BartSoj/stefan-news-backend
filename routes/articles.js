const auth = require("../middleware/auth");
const router = require("express").Router();
let Article = require("../models/article.model");
const User = require("../models/user.model");

router.get("/categories", (req, res) => {
    Article.find({status: "zatwierdzony"}).distinct("category").then(category => res.json(category)).catch(err => res.status(400).json("Error: " + err));
});

router.get("/limit/:limit", (req, res) => {
    Article.find({status: "zatwierdzony"}).sort([["datetime", -1]]).limit(Number(req.params.limit)).then(article => res.json(article)).catch(err => res.status(400).json("Error: " + err));
});

router.get("/categories/:category/limit/:limit", (req, res) => {
    Article.find({
        category: req.params.category,
        status: "zatwierdzony"
    }).sort([["datetime", -1]]).limit(Number(req.params.limit)).then(article => res.json(article)).catch(err => res.status(400).json("Error: " + err));
});

router.get("/my", auth, (req, res) => {
    Article.find({authorId: req.user}).select("author showAuthor datetime title category status").sort([["datetime", -1]]).then(article => res.json(article)).catch(err => res.status(400).json("Error: " + err));
});

router.get("/all", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const articles = await Article.find().select("author showAuthor datetime title category status").sort([["datetime", -1]]);
    return res.json(articles);
});

router.get("/:id", auth, async (req, res) => {
    const article = await Article.findById(req.params.id);
    const user = await User.findById(req.user);
    if (article.authorId !== user._id.toString() && user.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    return res.json(article);
});

router.post("/add", auth, (req, res) => {
    let {author, showAuthor, category, datetime, images, text, title} = req.body;
    if (!author || !category || !datetime || !text || !title) {
        return res.status(400).json({msg: "Nie wszystkie pola zostały uzupełnione"});
    }
    let [day, month, year] = datetime.split(".");
    datetime = (new Date(year, month - 1, day)).getTime();
    const newArticle = new Article({authorId: req.user, author, showAuthor, category, datetime, images, text, title});
    newArticle.save().then(() => res.json(true)).catch(err => res.status(400).json({error: err}));
});

router.post("/edit", auth, async (req, res) => {
    const {id, showAuthor, title, text, images, category} = req.body;
    const article = await Article.findById(id);
    if (article.authorId !== req.user) {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const status = article.status === "zatwierdzony" ? "edytowany" : "nowy";
    await Article.findByIdAndUpdate(id, {showAuthor, title, text, images, category, status});
    return res.json(true);
});

router.post("/setStatus", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const {id, status} = req.body;
    await Article.findByIdAndUpdate(id, {status});
    return res.json(true);
});

router.delete("/:id", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    await Article.findByIdAndDelete(req.params.id);
    res.json(true);
});

module.exports = router;