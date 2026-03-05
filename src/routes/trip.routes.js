const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const { createTrip, getTrips } = require("../controllers/trip.controller");

/**
 * @openapi
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, createTrip);

/**
 * @openapi
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mysore Trip
 *               description:
 *                 type: string
 *                 example: Weekend ride with friends
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-12
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-15
 *     responses:
 *       201:
 *         description: Trip created successfully
 */
router.get("/", authMiddleware, getTrips);

module.exports = router;