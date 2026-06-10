const prisma = require("../config/prisma");


// =======================
// CREATE TRIP
// =======================
module.exports.createTrip = async (req, res) => {
  try {

    const userId = req.user.id;
    let { title, description, startDate, endDate } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({
        message: "Title and startDate are required"
      });
    }

    if (!endDate) {
      endDate = startDate;
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
            role: "admin",
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
// GET TRIP BY ID
// =======================
module.exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id; // If not public, we need auth. But we can also handle public differently.

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          where: { status: "accepted" },
          include: {
            user: { select: { id: true, name: true, profileImage: true } }
          }
        }
      }
    });

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    return res.json({ trip });
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

const isUserAdminOrCreator = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return false;
  if (trip.created_by === userId) return true;

  const member = await prisma.tripMember.findFirst({
    where: { trip_id: tripId, user_id: userId, status: "accepted" }
  });
  return member?.role === "admin";
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

    // Check trip ownership / admin
    const isAdmin = await isUserAdminOrCreator(tripId, userId);
    if (!isAdmin) {
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


// =======================
// UPDATE TRIP
// =======================
module.exports.updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    let { title, description, startDate, endDate } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isAdmin = await isUserAdminOrCreator(tripId, userId);
    if (!isAdmin) return res.status(403).json({ message: "Not allowed" });

    if (!endDate && startDate) {
      endDate = startDate;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        title,
        description,
        start_date: startDate ? new Date(startDate) : undefined,
        end_date: endDate ? new Date(endDate) : undefined,
      }
    });

    return res.json({ message: "Trip updated successfully", trip: updatedTrip });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// UPDATE ITINERARY ENTRY
// =======================
module.exports.updateItineraryEntry = async (req, res) => {
  try {
    const { tripId, entryId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Content is required" });

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    
    const isAdmin = await isUserAdminOrCreator(tripId, userId);
    if (!isAdmin) return res.status(403).json({ message: "Not allowed" });

    const updatedEntry = await prisma.itineraryDay.update({
      where: { id: entryId },
      data: { content }
    });

    return res.json({ message: "Entry updated", entry: updatedEntry });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// DELETE ITINERARY ENTRY
// =======================
module.exports.deleteItineraryEntry = async (req, res) => {
  try {
    const { tripId, entryId } = req.params;
    const userId = req.user.id;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    
    const isAdmin = await isUserAdminOrCreator(tripId, userId);
    if (!isAdmin) return res.status(403).json({ message: "Not allowed" });

    await prisma.itineraryDay.delete({
      where: { id: entryId }
    });

    return res.json({ message: "Entry deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// REQUEST TO JOIN TRIP
// =======================
module.exports.requestJoinTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.tripMember.findFirst({
      where: { trip_id: tripId, user_id: userId }
    });

    if (existing) {
      return res.status(400).json({ message: "Request or membership already exists" });
    }

    const member = await prisma.tripMember.create({
      data: {
        trip_id: tripId,
        user_id: userId,
        status: "pending_request",
        joined_at: new Date()
      }
    });

    return res.json({ message: "Join request sent", member });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// INVITE TO TRIP
// =======================
module.exports.inviteToTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { friendId } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.created_by !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const existing = await prisma.tripMember.findFirst({
      where: { trip_id: tripId, user_id: friendId }
    });

    if (existing) {
      return res.status(400).json({ message: "Friend is already a member or invited" });
    }

    const member = await prisma.tripMember.create({
      data: {
        trip_id: tripId,
        user_id: friendId,
        status: "pending_invite",
        joined_at: new Date()
      }
    });

    return res.json({ message: "Invite sent", member });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// GET TRIP REQUESTS & INVITES
// =======================
module.exports.getTripRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const joinRequests = await prisma.tripMember.findMany({
      where: {
        status: "pending_request",
        trip: { created_by: userId }
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        trip: { select: { id: true, title: true } }
      }
    });

    const invites = await prisma.tripMember.findMany({
      where: {
        status: "pending_invite",
        user_id: userId
      },
      include: {
        trip: { select: { id: true, title: true, created_by: true } }
      }
    });

    return res.json({ joinRequests, invites });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// RESPOND TO TRIP REQUEST/INVITE
// =======================
module.exports.respondToTripRequest = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { action } = req.body; 
    const userId = req.user.id;

    const member = await prisma.tripMember.findUnique({
      where: { id: memberId },
      include: { trip: true }
    });

    if (!member) return res.status(404).json({ message: "Not found" });

    if (member.status === "pending_request" && member.trip.created_by !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (member.status === "pending_invite" && member.user_id !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (action === "accept") {
      const updated = await prisma.tripMember.update({
        where: { id: memberId },
        data: { status: "accepted" }
      });
      return res.json({ message: "Accepted", member: updated });
    } else if (action === "reject") {
      await prisma.tripMember.delete({ where: { id: memberId } });
      return res.json({ message: "Rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// MAKE ADMIN
// =======================
module.exports.makeMemberAdmin = async (req, res) => {
  try {
    const { tripId, memberId } = req.params;
    const userId = req.user.id;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.created_by !== userId) {
      return res.status(403).json({ message: "Only trip creator can assign admins" });
    }

    const member = await prisma.tripMember.findUnique({ where: { id: memberId } });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const updated = await prisma.tripMember.update({
      where: { id: memberId },
      data: { role: "admin" }
    });

    return res.json({ message: "Member is now an admin", member: updated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};