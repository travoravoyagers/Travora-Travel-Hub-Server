const prisma = require("../config/prisma");

module.exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all friends
    const friendships = await prisma.friendship.findMany({
      where: { user_id: userId }
    });
    const friendIds = friendships.map(f => f.friend_id);

    // Get pending sent requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: { sender_id: userId, status: "pending" }
    });
    const pendingIds = sentRequests.map(r => r.receiver_id);

    // Exclude self, friends, and pending requests
    const excludeIds = [userId, ...friendIds, ...pendingIds];

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds }
      },
      select: {
        id: true,
        name: true,
        profileImage: true
      }
    });

    return res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Check existing request
    const existing = await prisma.friendRequest.findFirst({
      where: {
        sender_id: senderId,
        receiver_id: receiverId
      }
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Request already sent" });
      } else if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      // If rejected, allow re-sending by updating status
      const updated = await prisma.friendRequest.update({
        where: { id: existing.id },
        data: { status: "pending" }
      });
      return res.json({ message: "Friend request sent", request: updated });
    }

    // Also check reverse request
    const reverse = await prisma.friendRequest.findFirst({
      where: { sender_id: receiverId, receiver_id: senderId, status: "pending" }
    });

    if (reverse) {
      return res.status(400).json({ message: "They already sent you a request" });
    }

    const request = await prisma.friendRequest.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending"
      }
    });

    return res.json({ message: "Friend request sent", request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.friendRequest.findMany({
      where: { receiver_id: userId, status: "pending" },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    return res.json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.receiver_id !== userId || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Update request
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "accepted" }
    });

    // Create friendships
    await prisma.friendship.createMany({
      data: [
        { user_id: userId, friend_id: request.sender_id },
        { user_id: request.sender_id, friend_id: userId }
      ],
      skipDuplicates: true
    });

    return res.json({ message: "Request accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.receiver_id !== userId || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "rejected" }
    });

    return res.json({ message: "Request rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendships = await prisma.friendship.findMany({
      where: { user_id: userId },
      include: {
        friend: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    });

    return res.json(friendships.map(f => f.friend));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
