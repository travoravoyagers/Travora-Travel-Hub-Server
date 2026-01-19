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
