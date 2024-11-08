"use strict";
// Description: Contains backend endpoints for the manage group page (/group)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const groupController_1 = __importDefault(require("../controllers/groupController"));
const express_openid_connect_1 = require("express-openid-connect");
router.route('/get-group/:groupID').get((0, express_openid_connect_1.requiresAuth)(), groupController_1.default.getGroup);
router.route('/add-expense').post((0, express_openid_connect_1.requiresAuth)(), groupController_1.default.createExpense);
exports.default = router;
