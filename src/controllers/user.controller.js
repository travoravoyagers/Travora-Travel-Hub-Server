const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// GET PROFILE
module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROFILE (name, email, profileImage)
module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let { name, email, profileImage } = req.body;

    // If email is being updated, check uniqueness
    if (email) {
      email = email.trim().toLowerCase();

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(profileImage !== undefined && { profileImage }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// CHANGE PASSWORD
module.exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const tripCount = await prisma.tripMember.count({
      where: { user_id: userId }
    });

    return res.json({
      id: user.id,
      name: user.name,
      profileImage: user.profileImage,
      joinedDate: user.createdAt,
      tripCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: { user_id: userId }
        }
      },
      orderBy: { start_date: "desc" }
    });
    return res.json({ trips });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getUserItinerary = async (req, res) => {
  try {
    const { userId, tripId } = req.params;
    
    const member = await prisma.tripMember.findFirst({
      where: { trip_id: tripId, user_id: userId }
    });

    if (!member) {
      return res.status(404).json({ message: "Trip not found" });
    }

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
