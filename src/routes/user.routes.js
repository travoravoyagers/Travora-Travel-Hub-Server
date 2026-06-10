const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  getUserTrips,
  getUserItinerary
} = require("../controllers/user.controller");

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/profile", authMiddleware, getProfile);

/**
 * @openapi
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: test
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               profileImage:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", authMiddleware, updateProfile);

/**
 * @openapi
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: test@123
 *               newPassword:
 *                 type: string
 *                 example: test@12345
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/change-password", authMiddleware, changePassword);


/**
 * @openapi
 * /api/user/{userId}:
 *   get:
 *     summary: Get a user's public profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/:userId", authMiddleware, getPublicProfile);

/**
 * @openapi
 * /api/user/{userId}/trips:
 *   get:
 *     summary: Get a user's public trips
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's trips
 */
router.get("/:userId/trips", authMiddleware, getUserTrips);

/**
 * @openapi
 * /api/user/{userId}/trips/{tripId}/itinerary:
 *   get:
 *     summary: Get a user's public trip itinerary
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip itinerary days
 */
router.get("/:userId/trips/:tripId/itinerary", authMiddleware, getUserItinerary);

module.exports = router;
