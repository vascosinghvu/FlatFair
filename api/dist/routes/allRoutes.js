"use strict";
// Description: Contains backend endpoints and associated functions
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const allController_1 = __importDefault(require("../controllers/allController"));
router.route('/test').post(allController_1.default.test);
// router.route('/create-group').post(allController_1.default.createGroup);
exports.default = router;
