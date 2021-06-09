const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/user.model");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
    try {
        let {firstname, lastname, email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({msg: "Nie wszystkie pola zostały uzupełnione"});
        }
        if (password.length < 5) {
            return res.status(400).json({msg: "Hasło musi mieć przynajmniej 5 znaków"});
        }
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            return res.status(400).json({msg: "Konto z tym adresem email już istnieje"});
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = new User({
            firstname, lastname, email, password: passwordHash
        })
        const savedUser = await newUser.save();
        const token = jwt.sign({id: savedUser._id}, JWT_SECRET);
        return res.json({token});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({msg: "Nie wszystkie pola zostały uzupełnione"});
    }
    const user = await User.findOne({email: email});
    if (!user) {
        return res.status(400).json({msg: "Nie można znaleźć konta z tym adresem email"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({msg: "Podano błędne hasło"});
    }
    const token = jwt.sign({id: user._id}, JWT_SECRET);
    return res.json({token});
});

router.delete("/delete", auth, async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
});

router.delete("/delete/:id", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json(deletedUser);
});

router.post("/tokenIsValid", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.json(false);
    }
    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
        return res.json(false);
    }
    const user = await User.findById(verified.id);
    if (!user) {
        return res.json(false);
    }
    return res.json(true);
});

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        image: user.image,
        description: user.description,
        role: user.role,
        show: user.show
    });
});

router.get("/", async (req, res) => {
    const users = await User.find({show: true});
    return res.json(users.map(({_id, firstname, lastname, image, description}) => ({
        _id,
        firstname,
        lastname,
        image,
        description
    })));
});

router.get("/all", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const users = await User.find();
    return res.json(users.map(({_id, firstname, lastname, email, role, show}) => ({
        _id,
        firstname,
        lastname,
        email,
        role,
        show
    })));
});

router.post("/updateRole", auth, async (req, res) => {
    const admin = await User.findById(req.user);
    if (admin.role !== "admin") {
        return res.status(401).json({msg: "Nie masz uprawnień"});
    }
    const {user, role} = req.body;
    await User.findByIdAndUpdate(user, {role});
    return res.json(true);
});

router.post("/update", auth, async (req, res) => {
    const {email, description, show} = req.body;
    await User.findByIdAndUpdate(req.user, {email, description, show});
    return res.json(true);
});

router.post("/updateImage", auth, async (req, res) => {
    await User.findByIdAndUpdate(req.user, {image: req.body.image});
    return res.json(true);
});

module.exports = router;