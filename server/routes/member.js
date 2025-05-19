const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'profile/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


// 로그인하기
const JWT_KEY = "test-test";
router.post("/login", async (req, res) => {
    let { userId, password } = req.body;
    try { // db에 데이터 로직 요청
        let query = "SELECT userId, email, userName, password FROM MEMBER WHERE userId = ? "
        let [user] = await db.query(query, [userId]);
        let result = {};
        if (user.length > 0) {
            let isMatch = await bcrypt.compare(password, user[0].password);
            if (isMatch) {
                // 토큰 만들기
                let payload = {
                    userId: user[0].userId,
                    userName: user[0].userName,
                    email: user[0].email,
                }
                const token = jwt.sign(payload, JWT_KEY, { expiresIn: '1h' });
                console.log("token ===> ", token);
                result = {
                    // 토큰 리턴
                    message: "로그인 성공",
                    token
                }
            } else {
                result = {
                    message: "비밀번호 확인"
                }
            }
        } else {
            result = {
                message: "아이디 확인 바람"
            }
        }
        res.json(result);
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})


// 회원가입 하기
router.post('/join', async (req, res) => {
    let { userId, email, password, userName } = req.body;
    try {

        // 중복 아이디 체크
        let [idCheck] = await db.query("SELECT * FROM MEMBER WHERE userid = ?", [userId]);
        if (idCheck.length > 0) {
            return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
        }

        // 이메일 중복 확인
        let [emailCheck] = await db.query("SELECT * FROM MEMBER WHERE email = ?", [email]);
        if (emailCheck.length > 0) {
            return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
        }

        let hashPwd = await bcrypt.hash(password, 10);

        // MEMBER 테이블에 사용자 정보 삽입
        let query = "INSERT INTO MEMBER (USERID, EMAIL, PASSWORD, USERNAME, REGDATE) VALUES (?, ?, ?, ?, NOW())";
        let [result] = await db.query(query, [userId, email, hashPwd, userName]);

        // PROFILE 테이블에 기본 프로필 정보 삽입 (USERID에 해당하는 프로필 정보 생성)
        let profileQuery = "INSERT INTO PROFILE (USERID, PRIVATE_YN) VALUES (?, ?)";
        await db.query(profileQuery, [userId, 'N']); // 기본 프로필 이미지와 공개 여부 기본값 'N'
        res.json({
            message: "회원가입 완료",
            result: result
        })
    } catch (err) {
        console.log("에러 발생");
        console.log(err.message);
        res.status(500).send("Server Error")
    }
})


// 비밀번호 찾기
router.post("/verifyUserId", async (req, res) => {
    const { userId } = req.body;
    try {
        const query = "SELECT userId FROM MEMBER WHERE userId = ?";
        const [rows] = await db.query(query, [userId]);
        if (rows.length > 0) {
            res.json({ success: true, message: "아이디 확인됨. 새 비밀번호를 입력하세요." });
        } else {
            res.json({ success: false, message: "존재하지 않는 아이디입니다." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류 발생" });
    }
});

const passwordChangeRecords = new Map(); // userId → { count, lastChangeTime }

router.post("/resetPassword", async (req, res) => {
    const { userId, newPassword } = req.body;

    const now = Date.now();
    const cooldown = 30 * 1000; // 30초 제한
    const maxChanges = 5;

    const record = passwordChangeRecords.get(userId) || { count: 0, lastChangeTime: 0 };

    // 최근 30초 동안 5번 이상 변경한 경우 차단
    if (record.count >= maxChanges && now - record.lastChangeTime < cooldown) {
        const wait = Math.ceil((cooldown - (now - record.lastChangeTime)) / 1000);
        return res.status(429).json({ message: `비밀번호를 너무 자주 변경하고 있습니다. ${wait}초 후에 다시 시도하세요.` });
    }

    // 30초 이상 지났으면 카운트 초기화
    if (now - record.lastChangeTime >= cooldown) {
        record.count = 0;
    }

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        const query = "UPDATE MEMBER SET password = ? WHERE userId = ?";
        await db.query(query, [hashed, userId]);

        // 성공 시 카운트 증가 및 시간 기록
        record.count += 1;
        record.lastChangeTime = now;
        passwordChangeRecords.set(userId, record);

        res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류 발생" });
    }
});


module.exports = router;