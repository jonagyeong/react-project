const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')


router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const [rows] = await db.query(
        "SELECT friend_userid FROM close_friend WHERE userid = ?",
        [userId]
    );
    const friendIds = rows.map(r => r.friend_userid);
    res.json({ list: friendIds });
});


router.post("/", async (req, res) => {
    const { userId, friendUserId } = req.body;
    try {
        await db.query("INSERT INTO CLOSE_FRIEND (userId, friend_userId) VALUES (?, ?)", [userId, friendUserId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
});


router.post("/remove", async (req, res) => {
    const { userId, friendUserId } = req.body;
    try {
        await db.query("DELETE FROM CLOSE_FRIEND WHERE userId = ? AND friend_userId = ?", [userId, friendUserId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
});




module.exports = router;