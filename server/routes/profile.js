const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth');

// ✅ 추천 친구 (로그인한 사용자 제외 랜덤 추천 5명)
router.get("/recommend/:userId", async (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT userId, userName 
        FROM MEMBER 
        WHERE userId != ? 
        ORDER BY RAND() 
        LIMIT 5
    `;

    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("추천 친구 조회 실패:", err);
        res.status(500).json({ error: "추천 친구 조회 실패" });
    }
});

// ✅ 내가 팔로우하는 사람 목록
router.get("/following/:userId", async (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT m.userId, m.userName
        FROM FOLLOW f
        JOIN MEMBER m ON f.TO_USERID = m.userId
        WHERE f.FROM_USERID = ? AND f.STATUS = 'ACCEPTED'
    `;

    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("팔로잉 목록 조회 실패:", err.message);
        res.status(500).send("Server Error");
    }
});

// ✅ 나를 팔로우하는 사람 목록
router.get("/followers/:userId", async (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT m.userId, m.userName
        FROM FOLLOW f
        JOIN MEMBER m ON f.FROM_USERID = m.userId
        WHERE f.TO_USERID = ? AND f.STATUS = 'ACCEPTED'
    `;

    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("팔로워 목록 조회 실패:", err.message);
        res.status(500).send("Server Error");
    }
});






// ✅ 프로필 + 피드 썸네일 목록 조회
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const profileQuery = `
            SELECT * 
            FROM PROFILE P 
            INNER JOIN MEMBER M ON M.USERID = P.USERID 
            WHERE P.USERID = ?
        `;

        const feedQuery = `
            SELECT * 
            FROM FEED F 
            INNER JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO 
            WHERE F.USERID = ? AND I.THUMBNAILYN = 'Y'
        `;

        const [profileData] = await db.query(profileQuery, [userId]);
        const [feedData] = await db.query(feedQuery, [userId]);

        res.json({
            message: "success",
            info: profileData[0],
            FeedList: feedData,
        });
    } catch (err) {
        console.error("프로필/피드 조회 실패:", err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/yn/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        let query = "SELECT PRIVATE_YN FROM PROFILE WHERE USERID = ?"
        let [rows] = await db.query(query, [userId])  // 안전한 방식
        res.json({
            message: "success",
            yn: rows[0]?.PRIVATE_YN || "N"
        })
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})

router.put("/privacy", async (req, res) => {
    const { userId, isPrivate } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }

    try {
        const connection = await db.getConnection();
        const [result] = await connection.execute(
            "UPDATE profile SET private_yn = ? WHERE userid = ?",
            [isPrivate ? "Y" : "N", userId]
        );
        connection.release();

        res.json({ success: true, message: "Privacy setting updated" });
    } catch (err) {
        console.error("Error updating privacy:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});





// ✅ 친한 친구 목록 조회
router.get("/closeFriends/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT friend_userid 
            FROM close_friend 
            WHERE userid = ?
        `;
        const [results] = await db.query(query, [userId]);

        res.json({ closeFriends: results.map(row => row.friend_userid) });
    } catch (err) {
        console.error("친한 친구 목록 조회 실패:", err.message);
        res.status(500).send("Server Error");
    }
});

// ✅ 친한 친구 추가
router.post("/addCloseFriend", async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const query = `
            INSERT INTO close_friend (userid, friend_userid, regdate)
            VALUES (?, ?, NOW())
        `;
        await db.query(query, [userId, friendId]);

        res.json({ message: "친구 추가 성공" });
    } catch (err) {
        console.error("친한 친구 추가 실패:", err.message);
        res.status(500).send("Server Error");
    }
});

// ✅ 친한 친구 삭제
router.post("/removeCloseFriend", async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        const query = `
            DELETE FROM close_friend 
            WHERE userid = ? AND friend_userid = ?
        `;
        await db.query(query, [userId, friendId]);

        res.json({ message: "친구 삭제 성공" });
    } catch (err) {
        console.error("친한 친구 삭제 실패:", err.message);
        res.status(500).send("Server Error");
    }
});

router.get('/info/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        let query = "SELECT * FROM MEMBER M "
            + " INNER JOIN PROFILE P ON M.USERID = P.USERID "
            + " WHERE M.USERID = ?"
        let profile = await db.query(query, [userId])
        res.json({
            message : "success",
            profile : profile
        })
    } catch (err) {
        console.error("친한 친구 목록 조회 실패:", err.message);
        res.status(500).send("Server Error");
    }
})


module.exports = router;
