const JWT = require("jsonwebtoken");

/***
 * Function tạo mới một token
 * userInfo, secretKey (or secretSignature), tokenLife
 */
const generateToken = async (userInfo, secretKey, tokenLife) => {
    try {
        return JWT.sign(userInfo, secretKey, {
            algorithm: "HS256",
            expiresIn: tokenLife,
        });
    } catch (error) {
        throw new Error(error);
    }
};

/***
 * Function kiểm tra token hợp lệ
 */
const verifyToken = async (token, secretKey) => {
    try {
        return JWT.verify(token, secretKey);
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    generateToken,
    verifyToken,
};
