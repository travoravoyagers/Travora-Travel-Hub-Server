const prisma = require("../config/prisma");

// CREATE TRIP
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


// GET USER TRIPS
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