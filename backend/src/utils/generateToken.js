const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (res,user) => {
    const token = jwt.sign(
        {userId: user._id, isAdmin: user.isAdmin},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "1d"}
    );

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || true,
        sameSite: "none",
        maxAge: 24*60*60*1000,
    });
};

module.exports = generateToken;