// Description: Contains backend endpoints and associated functions

const express = require('express')
const router = express.Router()
import allController from '../controllers/allController'
import { requiresAuth } from 'express-openid-connect'

router.route('/test').post(allController.test)

router.route('/create-group').post(allController.createGroup)

// Route for login status
router.route('/').get(allController.createUser);

// Route for user profile
router.route('/profile').get(requiresAuth(), allController.getProfile);

// Route for login (initiates Auth0 login)
router.route('/login').get(allController.login);

export default router