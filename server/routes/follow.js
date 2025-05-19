const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')


// 내가 맞팔중인 목록 조회
router.get('/mutual/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [following] = await db.query(
            "SELECT to_userId FROM follow WHERE from_userId = ? AND status = 'ACCEPTED'",
            [userId]
        );

        const [followers] = await db.query(
            "SELECT from_userId FROM follow WHERE to_userId = ? AND status = 'ACCEPTED'",
            [userId]
        );

        const mutual = following
            .map(f => f.to_userId)
            .filter(id => followers.some(f => f.from_userId === id));

        res.json({ mutual });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 팔로우 중인지 체크
router.post("/check", async (req, res) => {
    let { fromUserId, toUserId } = req.body;
    try {
        // 팔로우 테이블에서 해당 관계가 존재하는지 확인
        let query = "SELECT * FROM FOLLOW WHERE FROM_USERID = ? AND TO_USERID = ?";
        let follow = await db.query(query, [fromUserId, toUserId]);

        if (follow.length === 0) {
            // 팔로우 관계가 없으면 요청 상태를 "NOT FOLLOWING"으로 처리
            return res.json({
                message: "success",
                follow: false,
                status: 'NOT FOLLOWING' // 팔로우 관계가 없을 경우
            });
        }

        const followStatus = follow[0].status; // 상태 값 확인 (ACCEPTED, PENDING 등)

        // 팔로우 관계가 존재하고 상태가 PENDING이면 "요청중"
        if (followStatus === 'PENDING') {
            return res.json({
                message: "success",
                follow: false, // 아직 팔로우되지 않은 상태
                status: 'PENDING' // 팔로우 요청이 대기 중
            });
        }

        // 팔로우 관계가 존재하고 상태가 ACCEPTED이면 팔로우됨
        return res.json({
            message: "success",
            follow: true, // 팔로우 된 상태
            status: 'ACCEPTED' // 팔로우 수락됨
        });
    } catch (err) {
        console.log("에러 발생!")
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})




// 팔로우 취소 API
router.post('/unfollow', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
    try {
        // FOLLOW 테이블에서 팔로우 관계 삭제
        let query = "DELETE FROM FOLLOW WHERE FROM_USERID = ? AND TO_USERID = ?";
        await db.query(query, [fromUserId, toUserId]);


        res.json({ message: "팔로우가 취소되었습니다." });
    } catch (err) {
        console.error("팔로우 취소 중 오류 발생:", err);
        res.status(500).json({ error: "팔로우 취소 중 오류 발생" });
    }
});





router.post("/", async (req, res) => {
    const { fromUserId, toUserId } = req.body;  // 요청 본문에서 userId들을 받아옴

    try {
        // 1. 팔로우가 이미 존재하는지 확인
        let [existingFollow] = await db.query(
            "SELECT * FROM FOLLOW WHERE FROM_USERID = ? AND TO_USERID = ?",
            [fromUserId, toUserId]
        );

        if (existingFollow.length > 0) {
            return res.status(400).json({ message: "이미 팔로우한 사용자입니다." });
        }

        // 2. 상대방의 프로필 공개 여부 확인 (비공개 계정인 경우 상태 'PENDING', 공개 계정인 경우 'ACCEPTED')
        let [profile] = await db.query("SELECT * FROM PROFILE WHERE USERID = ?", [toUserId]);
        if (profile.length === 0) {
            return res.status(404).json({ message: "상대방 프로필을 찾을 수 없습니다." });
        }

        const status = profile[0].PRIVATE_YN === 'Y' ? 'PENDING' : 'ACCEPTED';

        // 3. FOLLOW 테이블에 팔로우 관계 추가
        let query = "INSERT INTO FOLLOW (FROM_USERID, TO_USERID, REGDATE, STATUS) VALUES (?, ?, NOW(), ?)";
        await db.query(query, [fromUserId, toUserId, status]);

        // 4. 성공적으로 팔로우 추가
        return res.json({ message: "팔로우 성공", status });
    } catch (err) {
        console.error("팔로우 처리 중 오류 발생", err);
        return res.status(500).json({ error: "서버 오류" });
    }
});

router.get("/other/:otherUserId", async (req, res) => {
    let { otherUserId } = req.params;
    try {

        let [rows] = await db.query("SELECT PRIVATE_YN FROM PROFILE WHERE USERID = ?", [otherUserId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "success",
            private: rows[0].PRIVATE_YN // 여기서 직접 값 꺼냄
        });
    } catch (err) {
        console.log("에러 발생")
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})


// 팔로우 요청 승인 API
router.post('/accept', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
    try {
        // 팔로우 요청 상태가 'PENDING'일 때만 승인 가능
        let [followStatus] = await db.query("SELECT * FROM FOLLOW WHERE FROM_USERID = ? AND TO_USERID = ? AND STATUS = 'PENDING'", [fromUserId, toUserId]);

        if (followStatus.length === 0) {
            return res.status(400).json({ message: "승인할 팔로우 요청이 없습니다." });
        }

        // 팔로우 상태를 'ACCEPTED'로 변경
        let query = "UPDATE FOLLOW SET STATUS = 'ACCEPTED' WHERE FROM_USERID = ? AND TO_USERID = ?";
        await db.query(query, [fromUserId, toUserId]);

        // 팔로우 수 업데이트
        let updateQuery = "UPDATE PROFILE SET FOLLOW_COUNT = FOLLOW_COUNT + 1 WHERE USERID = ?";
        await db.query(updateQuery, [toUserId]); // 팔로우된 사람의 팔로워 수 증가
        await db.query(updateQuery, [fromUserId]); // 팔로우한 사람의 팔로우 수 증가

        res.json({ message: "팔로우 요청이 승인되었습니다." });
    } catch (err) {
        console.error("팔로우 요청 승인 중 오류 발생:", err);
        res.status(500).json({ error: "팔로우 요청 승인 중 오류 발생" });
    }
});


router.post('/reject', async (req, res) => {
    const { fromUserId, toUserId } = req.body;
    try {
        // 팔로우 요청 상태가 'PENDING'일 때만 거절 가능
        let [followStatus] = await db.query("SELECT * FROM FOLLOW WHERE FROM_USERID = ? AND TO_USERID = ? AND STATUS = 'PENDING'", [fromUserId, toUserId]);

        if (followStatus.length === 0) {
            return res.status(400).json({ message: "거절할 팔로우 요청이 없습니다." });
        }

        // 팔로우 상태를 'REJECTED'로 변경
        let query = "UPDATE FOLLOW SET STATUS = 'REJECTED' WHERE FROM_USERID = ? AND TO_USERID = ?";
        await db.query(query, [fromUserId, toUserId]);

        res.json({ message: "팔로우 요청이 거절되었습니다." });
    } catch (err) {
        console.error("팔로우 요청 거절 중 오류 발생:", err);
        res.status(500).json({ error: "팔로우 요청 거절 중 오류 발생" });
    }
});




module.exports = router;