const express = require("express")
const router = express.Router()
import groupController from "../controllers/groupController"
import { requiresAuth } from "express-openid-connect"
import userController from "../controllers/userController"
import {verifyToken} from "../config/authMiddleware"

// // router.route('/create-group').post(allController.createGroup)
// router.route("/create-group").post(requiresAuth(), groupController.createGroup)

// Route for user profile
// router.route("/profile").get(userController.getProfile)

router.route("/get-user").get(verifyToken, userController.getUser)

router.route("/login").post(userController.login)

router.route("/send-invite").post(userController.sendInvite)
router.route("/create-user").post(userController.createUser)
router.route("/delete-user").delete(userController.deleteUser)

router.route("/test").post(userController.test)

export default router
