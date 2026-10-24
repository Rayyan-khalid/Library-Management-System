import express from "express"
import {protectRoute} from "../middleware/auth.js" 

import { getProfile, updateProfile, submitBorrowRequest, downloadReceipt} from "../controller/userController.js"


const userRouter = express.Router();

    
userRouter.get("/getProfile", protectRoute, getProfile)
userRouter.put("/updateProfile", protectRoute, updateProfile)
userRouter.post("/borrow-request", protectRoute, submitBorrowRequest) 
userRouter.get("/receipt/:id", protectRoute, downloadReceipt);

export default userRouter;  