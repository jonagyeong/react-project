const express = require('express')
const db = require('../db')
const router = express.Router()

// 최근 검색어 조회
router.get('/history/:userId', async (req, res) => {
    let { userId } = req.params;
    try {
        let query = `
            SELECT 
                SH.KEYWORD, 
                SH.TYPE
            FROM SEARCH_HISTORY SH
            LEFT JOIN PROFILE P ON P.USERID = REPLACE(SH.KEYWORD, '@', '')  -- '@' 제외하고 조인
            WHERE SH.USERID = ?
            ORDER BY SH.REGDATE DESC
            LIMIT 20
        `;
        let [history] = await db.query(query, [userId]);
        res.json({
            message: "success",
            history: history.map(item => ({
                keyword: item.KEYWORD,
                type: item.TYPE,
                profileImg: '/default-profile.png',
                userName: item.USERNAME || ''
            }))
        });
    } catch (err) {
        console.log("에러발생!", err.message);
        res.status(500).send("Server Error");
    }
});


// 계정 자동완성 API (USERID 기준 + 프로필 이미지 포함)
router.get('/account', async (req, res) => {
    let { keyword } = req.query;
    try {
        let query = `
            SELECT USERID
            FROM PROFILE 
            WHERE USERID LIKE ? 
            LIMIT 20
        `;
        let [accounts] = await db.query(query, ['%' + keyword + '%']);
        res.json({
            message: "success",
            result: accounts.map(acc => ({
                userId: acc.USERID,
                keyword: '@' + acc.USERID,
                userName: acc.USERNAME || '',
                profileImg: '/default-profile.png'
            }))
        });
    } catch (err) {
        console.log("계정 자동완성 에러:", err.message);
        res.status(500).send("Server Error");
    }
});


// 검색 기록 저장 (계정 검색만)
router.post('/history', async (req, res) => {
    const { userId, keyword, type } = req.body;

    if (!userId || !keyword || !type) {
        return res.status(400).json({ message: "필수 데이터 누락" });
    }

    // type은 'account'만 허용, '@'로 시작하는 keyword만 허용
    if (type !== 'account' || !keyword.startsWith('@')) {
        return res.status(400).json({ message: "키워드 형식이 잘못되었습니다." });
    }

    try {
        // 이미 동일한 키워드가 존재하는지 확인
        const checkQuery = `
            SELECT 1 FROM SEARCH_HISTORY 
            WHERE USERID = ? AND KEYWORD = ? AND TYPE = ?
            LIMIT 1
        `;
        const [existing] = await db.query(checkQuery, [userId, keyword, type]);

        // 없을 때만 insert
        if (existing.length === 0) {
            const insertQuery = `
                INSERT INTO SEARCH_HISTORY (USERID, KEYWORD, TYPE, REGDATE) 
                VALUES (?, ?, ?, NOW())
            `;
            await db.query(insertQuery, [userId, keyword, type]);
        }

        res.json({ message: "검색 기록 저장 성공" });
    } catch (err) {
        console.log("검색 기록 저장 에러:", err.message);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router
