// Function to generate a token for a user

import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {
  // console.log(process.env.JWT_SECRET)
  return jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export { generateAccessToken, generateRefreshToken };