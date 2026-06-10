const prisma = require("../config/prisma");

module.exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: friendId },
          { sender_id: friendId, receiver_id: userId }
        ]
      },
      orderBy: { created_at: "asc" }
    });

    return res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const message = await prisma.message.create({
      data: {
        sender_id: userId,
        receiver_id: friendId,
        content
      }
    });

    if (req.io) {
      req.io.to(friendId).emit("receive_message", message);
    }

    return res.json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
