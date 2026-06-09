const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  createTrip,
  getTrips,
  deleteTrip,
  addItineraryDay,
  getItinerary
} = require("../controllers/trip.controller");


// =======================
// CREATE TRIP
// =======================
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
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Trip created successfully
 */
router.post("/", authMiddleware, createTrip);


// =======================
// GET TRIPS
// =======================
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


// =======================
// DELETE TRIP
// =======================
/**
 * @openapi
 * /api/trips/{tripId}:
 *   delete:
 *     summary: Delete a trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       404:
 *         description: Trip not found
 *       403:
 *         description: Not allowed
 */
router.delete("/:tripId", authMiddleware, deleteTrip);


// =======================
// ADD ITINERARY
// =======================

/**
 * @openapi
 * /api/trips/{tripId}/itinerary:
 *   post:
 *     summary: Add itinerary day
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
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
 *               - day_number
 *               - content
 *             properties:
 *               day_number:
 *                 type: integer
 *                 example: 1
 *               content:
 *                 type: string
 *                 example: "🚌 06:00 Reach Govindghat..."
 *     responses:
 *       200:
 *         description: Day added
 */

router.post("/:tripId/itinerary", authMiddleware, addItineraryDay);


/**
 * @openapi
 * /api/trips/{tripId}/itinerary:
 *   get:
 *     summary: Get itinerary
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of itinerary days
 */
router.get("/:tripId/itinerary", authMiddleware, getItinerary);


module.exports = router;