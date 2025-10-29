const express = require("express");
const router = express.Router();

// Controllers
const authController = require("../controllers/auth.controller");
const profileController = require("../controllers/profile.controller");
const informationController = require("../controllers/information.controller");
const transactionController = require("../controllers/transaction.controller");

// Middlewares
const authMiddleware = require("../middlewares/auth.middleware");
const { upload, handleUploadError } = require("../middlewares/upload.middleware");

// Validators
const { registerValidation, loginValidation, updateProfileValidation, topUpValidation, transactionValidation } = require("../validators/request.validator");

// Auth routes (public)
router.post("/registration", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);

// Profile routes (protected)
router.get("/profile", authMiddleware, profileController.getProfile);
router.put("/profile/update", authMiddleware, updateProfileValidation, profileController.updateProfile);
router.put("/profile/image", authMiddleware, upload.single("file"), handleUploadError, profileController.updateProfileImage);

// Information routes (protected)
router.get("/banner", authMiddleware, informationController.getBanner);
router.get("/services", authMiddleware, informationController.getServices);

// Transaction routes (protected)
router.get("/balance", authMiddleware, transactionController.getBalance);
router.post("/topup", authMiddleware, topUpValidation, transactionController.topUp);
router.post("/transaction", authMiddleware, transactionValidation, transactionController.transaction);
router.get("/transaction/history", authMiddleware, transactionController.getTransactionHistory);

module.exports = router;
