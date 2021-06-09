const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).json({msg: "Brak tokena autoryzującego, odmowa dostępu"});
        }
        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) {
            return res.status(401).json({msg: "Zły token autoryzujący, odmowa dostępu"});
        }
        req.user = verified.id;
        next();
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

module.exports = auth;