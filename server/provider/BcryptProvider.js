const bcrypt = require("bcrypt");

const generateHashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.SECRET_PASSWORD)
    );
    return hashedPassword;
};

const isMatch = async (inputPassword) => {
    return await bcrypt.compare(req.body.password, existUser.password);
};

module.exports = {
    generateHashPassword,
    isMatch,
};