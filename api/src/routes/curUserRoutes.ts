// Description: Contains backend endpoints for the manage group page (/group)

const express = require("express")
const router = express.Router()
import curUserController from "../controllers/userController"
import { requiresAuth } from "express-openid-connect"

router.route("/get-groups").get(requiresAuth(), curUserController.getGroups)

router.route("/get-user").get(requiresAuth(), curUserController.getUser)

export default router
