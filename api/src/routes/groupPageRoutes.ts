// Description: Contains backend endpoints for the manage group page (/group)

const express = require('express')
const router = express.Router()
import groupPageController from '../controllers/groupController'
import { requiresAuth } from 'express-openid-connect'

router.route('/get-group/:groupID').get(requiresAuth(), groupPageController.getGroup)

router.route('/add-expense').post(requiresAuth(), groupPageController.createExpense)

export default router