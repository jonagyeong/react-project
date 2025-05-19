const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')

router.post("/", async (req, res) => {
    const { userId, to_userid } = req.body;

    const checkSql = `SELECT * FROM block WHERE userId = ? AND to_userid = ?`;
    const insertSql = `INSERT INTO block (userId, to_userid) VALUES (?, ?)`;

    try {
        const [existing] = await db.query(checkSql, [userId, to_userid]);
        if (existing.length === 0) {
            await db.query(insertSql, [userId, to_userid]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error("차단 저장 실패", err);
        res.status(500).json({ success: false });
    }
});



module.exports = router;

