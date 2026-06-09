const prisma = require("../config/prisma");


// =======================
// CREATE TRIP
// =======================
module.exports.createTrip = async (req, res) => {
  try {

    const userId = req.user.id;
    const { title, description, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        message: "Title, startDate and endDate are required"
      });
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        created_by: userId,
        created_at: new Date(),

        members: {
          create: {
            user_id: userId,
            status: "accepted",
            joined_at: new Date()
          }
        }
      }
    });

    return res.status(201).json({
      message: "Trip created",
      trip
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};



// =======================
// GET USER TRIPS
// =======================
module.exports.getTrips = async (req, res) => {
  try {

    const userId = req.user.id;

    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: {
            user_id: userId
          }
        }
      },
      orderBy: {
        start_date: "asc"
      }
    });

    return res.json({ trips });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};



// =======================
// DELETE TRIP
// =======================
module.exports.deleteTrip = async (req, res) => {
  try {

    const { tripId: id } = req.params;
    const userId = req.user.id;

    const trip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    if (trip.created_by !== userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this trip"
      });
    }

    // delete trip members first
    await prisma.tripMember.deleteMany({
      where: {
        trip_id: id
      }
    });

    // delete itinerary days
    await prisma.itineraryDay.deleteMany({
      where: {
        trip_id: id
      }
    });

    // delete trip
    await prisma.trip.delete({
      where: {
        id
      }
    });

    return res.json({
      message: "Trip deleted successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// ADD ITINERARY DAY
// =======================
module.exports.addItineraryDay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;
    const { day_number, content } = req.body;

    if (!day_number || !content) {
      return res.status(400).json({
        message: "day_number and content are required"
      });
    }

    // Check trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.created_by !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const day = await prisma.itineraryDay.create({
      data: {
        trip_id: tripId,
        day_number,
        content
      }
    });

    return res.json({
      message: "Day added",
      day
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};



// =======================
// GET ITINERARY
// =======================
module.exports.getItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;

    const days = await prisma.itineraryDay.findMany({
      where: { trip_id: tripId },
      orderBy: { day_number: "asc" }
    });

    return res.json({ days });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};