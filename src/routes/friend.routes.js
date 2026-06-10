const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  getSuggestions,
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  getFriends
} = require("../controllers/friend.controller");

/**
 * @openapi
 * /api/friends/suggestions:
 *   get:
 *     summary: Get friend suggestions
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggested users
 */
router.get("/suggestions", authMiddleware, getSuggestions);

/**
 * @openapi
 * /api/friends/request:
 *   post:
 *     summary: Send a friend request
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request sent
 */
router.post("/request", authMiddleware, sendRequest);

/**
 * @openapi
 * /api/friends/requests:
 *   get:
 *     summary: Get incoming friend requests
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of incoming requests
 */
router.get("/requests", authMiddleware, getIncomingRequests);

/**
 * @openapi
 * /api/friends/accept:
 *   post:
 *     summary: Accept a friend request
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request accepted
 */
router.post("/accept", authMiddleware, acceptRequest);

/**
 * @openapi
 * /api/friends/reject:
 *   post:
 *     summary: Reject a friend request
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.post("/reject", authMiddleware, rejectRequest);

/**
 * @openapi
 * /api/friends:
 *   get:
 *     summary: Get all friends
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 */
router.get("/", authMiddleware, getFriends);

module.exports = router;
