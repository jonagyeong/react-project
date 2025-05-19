const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')


router.get('/rooms/:userId', async (req, res) => {
    let { userId } = req.params;
    try {
        let query = "SELECT R.ROOM_ID, R.CREATED_AT, "
            + " U.USERNAME, P.PROFILIMG, D.MESSAGE AS LAST_MESSAGE, D.REGDATE AS LAST_MESSAGE_TIME, D.READFLG, U.USERID "
            + " FROM DM_ROOM R "
            + " INNER JOIN DM_MEMBER M1 ON R.ROOM_ID = M1.ROOM_ID "
            + " INNER JOIN DM_MEMBER M2 ON R.ROOM_ID = M2.ROOM_ID AND M2.USERID != ? "
            + " INNER JOIN PROFILE P ON M2.USERID = P.USERID "
            + " INNER JOIN MEMBER U ON M2.USERID = U.USERID "
            + " LEFT JOIN ( "
            + "     SELECT DM1.ROOM_ID, DM1.MESSAGE, DM1.REGDATE, DM1.READFLG "
            + "     FROM DM DM1 "
            + "     INNER JOIN ( "
            + "         SELECT ROOM_ID, MAX(REGDATE) AS MAX_DATE "
            + "         FROM DM "
            + "         GROUP BY ROOM_ID "
            + "     ) DM2 ON DM1.ROOM_ID = DM2.ROOM_ID AND DM1.REGDATE = DM2.MAX_DATE "
            + " ) D ON R.ROOM_ID = D.ROOM_ID "
            + " WHERE M1.USERID = ? "
            + " ORDER BY D.REGDATE DESC";

        let [rooms] = await db.query(query, [userId, userId]);

        res.json({
            message: "success",
            rooms: rooms
        });

    } catch (err) {
        console.log("에러 발생");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.post('/read/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    try {
        const updateQuery = `
            UPDATE DM 
            SET READFLG = 'Y' 
            WHERE ROOM_ID = ? AND TO_USERID = ? AND READFLG = 'N'
        `;
        await db.query(updateQuery, [roomId, userId]);

        res.json({ message: "success" });
    } catch (err) {
        console.log("읽음 처리 에러:", err.message);
        res.status(500).send("Server Error");
    }
});


router.get('/message/:roomId', async (req, res) => {
    let { roomId } = req.params;
    try {
        let query = "SELECT DM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE "
            + " FROM DM "
            + " WHERE ROOM_ID = ? "
            + " ORDER BY REGDATE ASC"
        let [DMmessage] = await db.query(query, [roomId])
        res.json({
            message: "success",
            DMmessage: DMmessage
        })
    } catch (err) {
        console.log("에러 발생")
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})

router.post('/message', async (req, res) => {
    let { roomId, fromUserId, toUserId, message } = req.body;
    try {
        let insertQuery = "INSERT INTO DM (ROOM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE) "
            + " VALUES (?, ?, ?, ?, 'N', NOW())";
        let [result] = await db.query(insertQuery, [roomId, fromUserId, toUserId, message]);

        let selectQuery = "SELECT DM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE "
            + " FROM DM WHERE DM_ID = ?";
        let [rows] = await db.query(selectQuery, [result.insertId]);

        res.json({
            message: "success",
            DMmessage: rows[0]
        });

    } catch (err) {
        console.log("에러 발생")
        console.log(err.message)
        res.status(500).send("Server Error")
    }
});





module.exports = router;