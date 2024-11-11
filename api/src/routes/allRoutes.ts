// Description: Contains backend endpoints and associated functions

const express = require('express')
const router = express.Router()
import allController from '../controllers/allController'
import { requiresAuth } from 'express-openid-connect'

router.route('/test').get(allController.test)

// // Route for login status
// router.route('/').get(allController.createUser);

// // Route for user profile
// router.route('/profile').get(requiresAuth(), allController.getProfile);

// // Route for login (initiates Auth0 login)
// router.route('/login').get(allController.login);

// // Route for getting user information
// router.route('/current-user').get(requiresAuth(), allController.getUser);

// Route for sending invites
// router.route("/send-invite").post(allController.sendInvite);

export default router