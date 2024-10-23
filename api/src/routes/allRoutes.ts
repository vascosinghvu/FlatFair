// Description: Contains backend endpoints and associated functions

const express = require("express")
const router = express.Router()
import allController from "../controllers/allController"
import { requiresAuth } from "express-openid-connect"

router.route("/test").get(allController.test)

// router.route('/create-group').post(allController.createGroup)
// router.route('/create-group').post(requiresAuth(), allController.createGroup)

// Route for login status
router.route("/").get(allController.createUser)

// Route for user profile
router.route("/profile").get(requiresAuth(), allController.getProfile)

// Route for login (initiates Auth0 login)
router.route("/login").get(allController.login)

// Route for getting user information
router.route("/current-user").get(requiresAuth(), allController.getUser)

export default router
