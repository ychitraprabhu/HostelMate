const db = require('../db/connection');

// POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, hostel_id, message } = req.body;

    if (!receiver_id || !hostel_id || !message) {
      return res.status(400).json({ error: 'receiver_id, hostel_id, and message are required' });
    }

    await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, hostel_id, message) VALUES (?, ?, ?, ?)',
      [sender_id, receiver_id, hostel_id, message]
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get the latest message for each conversation the user is part of
    const [conversations] = await db.execute(
      `SELECT m.id, m.sender_id, m.receiver_id, m.hostel_id, m.message, m.sent_at,
              u.name as other_user_name, h.name as hostel_name, u.role as other_user_role
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       JOIN hostels h ON m.hostel_id = h.id
       WHERE m.id IN (
           SELECT MAX(id) 
           FROM messages 
           WHERE sender_id = ? OR receiver_id = ?
           GROUP BY 
               CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END,
               hostel_id
       )
       ORDER BY m.sent_at DESC`,
      [user_id, user_id, user_id, user_id]
    );

    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/chat/:hostel_id/:other_user_id
exports.getConversation = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { hostel_id, other_user_id } = req.params;

    // Fetch messages between logged-in user and other_user_id for the specific hostel
    const [messages] = await db.execute(
      `SELECT id, sender_id, receiver_id, hostel_id, message, sent_at
       FROM messages
       WHERE hostel_id = ? 
         AND ((sender_id = ? AND receiver_id = ?) 
              OR (sender_id = ? AND receiver_id = ?))
       ORDER BY sent_at ASC`,
      [hostel_id, user_id, other_user_id, other_user_id, user_id]
    );

    res.json(messages);
  } catch (error) {
    console.error('Error in getConversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
