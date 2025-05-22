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

// 차단 리스트 조회
router.get('/list/:userId', async (req, res) => {
    const { userId } = req.params;
    const sql = `SELECT to_userid FROM block WHERE userId = ?`;
    try {
        const [rows] = await db.query(sql, [userId]);
        res.json({ success: true, blockedList: rows.map(r => r.to_userid) });
    } catch (err) {
        console.error("차단 목록 조회 실패", err);
        res.status(500).json({ success: false });
    }
});

// 차단 해제
router.delete('/', async (req, res) => {
    const { userId, to_userid } = req.body;
    const sql = `DELETE FROM block WHERE userId = ? AND to_userid = ?`;
    try {
        await db.query(sql, [userId, to_userid]);
        res.json({ success: true });
    } catch (err) {
        console.error("차단 해제 실패", err);
        res.status(500).json({ success: false });
    }
});




module.exports = router;

