// Description: Contains backend endpoints for the manage group page (/group)

const express = require("express")
const router = express.Router()
import groupController from "../controllers/groupController"
import { requiresAuth } from "express-openid-connect"

router
  .route("/get-group/:groupID")
  .get(requiresAuth(), groupController.getGroup)

// router.route('/create-group').post(allController.createGroup)
router.route("/create-group").post(requiresAuth(), groupController.createGroup)

export default router
