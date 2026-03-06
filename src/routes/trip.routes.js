const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const { createTrip, getTrips, deleteTrip } = require("../controllers/trip.controller");

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
router.post("/", authMiddleware, createTrip);


/**
 * @openapi
 * /api/trips:
 *   get:
 *     summary: Get trips for current user
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get("/", authMiddleware, getTrips);

/**
 * @openapi
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Trip ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       404:
 *         description: Trip not found
 *       403:
 *         description: Not allowed to delete this trip
 */
router.delete("/:id", authMiddleware, deleteTrip);

module.exports = router;