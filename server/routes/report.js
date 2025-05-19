const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')

router.post("/", async (req, res) => {
    const { report_type, target_id, userID, reason } = req.body;

    const sql = `
        INSERT INTO report (report_type, target_id, userID, reason, regdate)
        VALUES (?, ?, ?, ?, NOW())
    `;

    try {
        await db.query(sql, [report_type, target_id, userID, reason]);
        res.json({ success: true });
    } catch (err) {
        console.error("신고 저장 실패", err);
        res.status(500).json({ success: false });
    }
});



module.exports = router;