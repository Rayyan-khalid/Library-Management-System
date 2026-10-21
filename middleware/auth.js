    // middleware/authMiddleware.js
    import jwt from "jsonwebtoken";
    import User from "../models/userModels.js";

    export const protectRoute = async (req, res, next) => {
      try {
        const token = req.cookies.token;            // Step 1: get token from cookie

        if (!token) {
          return res.status(401).json({ success: false, message: "Not authorized, please login" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);     // Step 2: decode token

        const user = await User.findById(decoded.id).select("-password");   // Step 3: find user in DB
        if (!user) {
          return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user; // attach the user so controllers can use req.user

        next();   // Step 5: pass to controller
      } catch (error) {
        console.log(error.message);
        return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
      }
    };

    export const adminOnly = (req, res, next) => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        return res.status(403).json({ success: false, message: "Access denied, admin only" });
      }
    };