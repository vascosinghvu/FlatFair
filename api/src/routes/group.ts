// Description: Contains backend endpoints for the manage group page (/group)

const express = require("express")
const router = express.Router()
import { verifyToken } from "../config/authMiddleware"
import groupController from "../controllers/groupController"
import { requiresAuth } from "express-openid-connect"

router.route("/get-group/:groupID").get(verifyToken, groupController.getGroup)

// router.route("/add-expense").post(requiresAuth(), groupController.createExpense)

// router.route('/create-group').post(allController.createGroup)
router.route("/create-group").post(verifyToken, groupController.createGroup)
router
  .route("/add-member/:groupID")
  .post(verifyToken, groupController.addMember)

router
  .route("/delete-member/:groupID")
  .post(verifyToken, groupController.deleteMember)

router
  .route("/delete-group/:groupID")
  .delete(verifyToken, groupController.deleteGroup)

router
  .route("/edit-leader/:groupID")
  .post(verifyToken, groupController.editLeader)

export default router
