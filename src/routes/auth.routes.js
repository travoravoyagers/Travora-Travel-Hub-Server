const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: test
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test@123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, me);

module.exports = router;
