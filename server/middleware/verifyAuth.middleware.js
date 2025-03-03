const createHttpError = require("http-errors");
const db = require("../models");
const jwt = require("jsonwebtoken");
const JwtProvider = require("../provider/JwtProvider");

async function isAuthorized(req, res, next) {
  const accessTokenFromCookie = req.cookies?.accessToken;
  console.log("accessTokenFromCookie", accessTokenFromCookie);
  console.log("-----------------------------------------");
  if (!accessTokenFromCookie) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(
      accessTokenFromCookie,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );

    console.log("accessTokenDecoded", accessTokenDecoded);
    console.log("-----------------------------------------");

    req.jwtDecoded = accessTokenDecoded;
    next();
  } catch (err) {
    console.log("Error from isAuthorized: ", err.message);

    //TH1: accessToken hết hạn, phải trả về mã lỗi GONE - 410 để gọi api refreshToken
    if (err.message?.includes("jwt expired")) {
      res.status(410).json({ message: "Require refresh token" });
      return;
    }

    //TH2: Nếu accessToken không hợp lệ, trả về mã 401 cho client xử lý logout
    res.status(401).json({ message: "Unauthorized: require login" });
  }
}

async function verifyToken(req, res, next) {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      throw createHttpError(401, "No token provided");
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        throw createHttpError.Forbidden(err.message);
      }
      req.userId = decoded.id;
      next();
    });
  } catch (err) {
    next(err);
  }
}

function checkRole(role) {
  return async (req, res, next) => {
    try {
      const existUser = await db.users.findById(req.userId).exec();
      if (!existUser) {
        throw createHttpError.NotFound("User not found");
      }
      if (existUser.role !== role) {
        throw createHttpError.Unauthorized(`Unauthorized! Account not ${role}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

const verifyAuth = {
  isAuthorized,
  verifyToken,
  isCustomer: checkRole("customer"),
  isAdmin: checkRole("admin"),
};

module.exports = verifyAuth;
