const express = require("express")
const router = express.Router()
import groupController from "../controllers/groupController"
import { requiresAuth } from "express-openid-connect"
import userController from "../controllers/userController"

// router.route('/create-group').post(allController.createGroup)
router.route("/create-group").post(requiresAuth(), groupController.createGroup)

// Route for user profile
router.route("/profile").get(requiresAuth(), userController.getProfile)
