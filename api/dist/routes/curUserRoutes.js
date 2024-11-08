"use strict";
// Description: Contains backend endpoints for the manage group page (/group)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const curUserController_1 = __importDefault(require("../controllers/curUserController"));
const express_openid_connect_1 = require("express-openid-connect");
router.route('/get-groups').get((0, express_openid_connect_1.requiresAuth)(), curUserController_1.default.getGroups);
router.route('/get-user').get((0, express_openid_connect_1.requiresAuth)(), curUserController_1.default.getUser);
exports.default = router;
