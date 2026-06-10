const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const { getChatMessages, sendMessage } = require("../controllers/chat.controller");

/**
 * @openapi
 * /api/chat/{friendId}:
 *   get:
 *     summary: Get chat messages with a friend
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/:friendId", authMiddleware, getChatMessages);

/**
 * @openapi
 * /api/chat/{friendId}:
 *   post:
 *     summary: Send a message to a friend
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sent message
 */
router.post("/:friendId", authMiddleware, sendMessage);

module.exports = router;
