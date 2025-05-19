const express = require('express')
const db = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../auth')

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'feed/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

/**
 * [POST] 게시글 등록
 * body: { userId, contents, location, visible_scope }
 */
router.post('/', async (req, res) => {
    let { userId, content, location, visible_scope } = req.body;

    try {
        // 1. 해시태그 추출
        let hashtags = [];
        if (content) {
            hashtags = content.match(/#[^\s#]+/g); // #단어만 추출
        }

        // 2. 본문에서 해시태그 제거 (공백도 함께 정리)
        let cleanedContent = content.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim();

        // 3. 피드 저장 (해시태그 제거된 본문)
        let query = "INSERT INTO FEED (userid, content, regdate, visible_scope, location) VALUES (?, ?, NOW(), ?, ?)";
        let result = await db.query(query, [userId, cleanedContent, visible_scope || null, location]);
        let feedId = result[0].insertId;

        // 4. FEED_HASHTAG 테이블에 삽입
        if (hashtags) {
            hashtags = [...new Set(hashtags.map(tag => tag.replace('#', '')))];
            for (let tag of hashtags) {
                await db.query("INSERT INTO FEED_HASHTAG (FEEDNO, TAG) VALUES (?, ?)", [feedId, tag]);
            }
        }

        res.json({
            message: "success",
            feedId: feedId,
            result: result[0]
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});


/**
 * [POST] 이미지 업로드
 * form-data: file[], feedId
 */
router.post('/upload', upload.array('file'), async (req, res) => {
    let { feedId, userId } = req.body;
    const files = req.files;

    try {
        let results = [];
        let thumbnail = 'Y';

        for (let file of files) {
            let filename = file.filename;
            let destination = file.destination;

            const query = "INSERT INTO FEED_IMG (feedno, userid, imgname, imgpath, thumbnailyn) VALUES (?, ?, ?, ?, ?)";
            const result = await db.query(query, [feedId, userId, filename, destination, thumbnail]);

            results.push(result);
            thumbnail = 'N';
        }

        res.json({
            message: "result",
            result: results
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message)
        res.status(500).send("Server Error");
    }
});

// /feed/list/:userId
router.get("/list/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // 1. 피드 + 이미지 조회
        let query = `
            SELECT * FROM FEED F 
            INNER JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO 
            WHERE THUMBNAILYN = 'Y'
            ORDER BY F.REGDATE DESC
        `;
        let [list] = await db.query(query);

        const feedNos = list.map(f => f.FEEDNO);
        if (feedNos.length === 0) {
            return res.json({ message: "success", list: [], blockedUsers: [] });
        }

        // 2. 해시태그 가져오기
        let placeholders = feedNos.map(() => '?').join(',');
        let hashtagQuery = `SELECT FEEDNO, TAG FROM FEED_HASHTAG WHERE FEEDNO IN (${placeholders})`;
        let [hashtag] = await db.query(hashtagQuery, feedNos);

        const hashtagMap = {};
        hashtag.forEach(tag => {
            if (!hashtagMap[tag.FEEDNO]) {
                hashtagMap[tag.FEEDNO] = [];
            }
            hashtagMap[tag.FEEDNO].push(tag.TAG);
        });

        const feedList = list.map(feed => ({
            ...feed,
            hashtag: hashtagMap[feed.FEEDNO] || []
        }));

        // 3. 차단한 사용자 목록 가져오기
        const [blocked] = await db.query(
            "SELECT TO_USERID FROM BLOCK WHERE USERID = ?",
            [userId]
        );
        const blockedUsers = blocked.map(b => b.TO_USERID);

        // 4. 응답
        res.json({
            message: "success",
            list: feedList,
            blockedUsers: blockedUsers
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});


router.get("/images/:feedNo", async (req, res) => {
    let { feedNo } = req.params;

    try {
        // 쿼리 실행
        let query = "SELECT * FROM FEED F "
            + " INNER JOIN FEED_IMG I ON I.FEEDNO = F.FEEDNO "
            + " WHERE I.FEEDNO = ?";
        const [ImgList] = await db.query(query, [feedNo]);
        res.json({
            message: "success",
            ImgList: ImgList
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/hashtags/:feedNo", async (req, res) => {
    let { feedNo } = req.params;

    try {
        let query = "SELECT * FROM FEED_HASHTAG WHERE FEEDNO = ?"
        const [hashTags] = await db.query(query, [feedNo])
        res.json({
            message: "success",
            hashTags: hashTags
        })
    } catch (err) {
        console.log("에러 발생");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})

// [DELETE] /feed/:feedId
router.delete('/:feedId', async (req, res) => {
    const feedId = req.params.feedId;

    try {
        // 1. 관련 이미지 삭제
        await db.query("DELETE FROM FEED_IMG WHERE FEEDNO = ?", [feedId]);

        // 2. 관련 해시태그 삭제
        await db.query("DELETE FROM FEED_HASHTAG WHERE FEEDNO = ?", [feedId]);

        // 3. 피드 본문 삭제
        await db.query("DELETE FROM FEED WHERE FEEDNO = ?", [feedId]);

        res.json({ message: "success" });
    } catch (err) {
        console.error("삭제 에러:", err.message);
        res.status(500).send("Server Error");
    }
});


// [PUT] /feed/:feedId
router.put('/:feedId', async (req, res) => {
    const feedId = req.params.feedId;
    let { userId, content, location, visible_scope, files } = req.body;

    try {
        // 1. 기존 게시글 조회
        let query = "SELECT * FROM FEED WHERE FEEDNO = ? AND USERID = ?";
        const [existingFeed] = await db.query(query, [feedId, userId]);

        if (existingFeed.length === 0) {
            return res.status(404).send("게시글을 찾을 수 없습니다.");
        }

        // 2. 해시태그 추출
        let hashtags = [];
        if (content) {
            hashtags = content.match(/#[^\s#]+/g); // #단어만 추출
        }

        // 3. 본문에서 해시태그 제거 (공백도 함께 정리)
        let cleanedContent = content.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim();

        // 4. 피드 내용 업데이트
        query = "UPDATE FEED SET content = ?, location = ?, visible_scope = ?, regdate = NOW() WHERE FEEDNO = ?";
        await db.query(query, [cleanedContent, location, visible_scope || null, feedId]);

        // 5. 기존 해시태그 삭제 (새로운 해시태그로 교체)
        await db.query("DELETE FROM FEED_HASHTAG WHERE FEEDNO = ?", [feedId]);

        // 6. 새로운 해시태그 삽입
        if (hashtags) {
            hashtags = [...new Set(hashtags.map(tag => tag.replace('#', '')))];
            for (let tag of hashtags) {
                await db.query("INSERT INTO FEED_HASHTAG (FEEDNO, TAG) VALUES (?, ?)", [feedId, tag]);
            }
        }

        // 7. 이미지 수정 (새로운 이미지가 있는 경우)
        if (files && files.length > 0) {
            // 기존 이미지 삭제
            await db.query("DELETE FROM FEED_IMG WHERE FEEDNO = ?", [feedId]);

            // 새로운 이미지 업로드
            let results = [];
            let thumbnail = 'Y';
            for (let file of files) {
                let filename = file.filename;
                let destination = file.destination;

                const query = "INSERT INTO FEED_IMG (feedno, userid, imgname, imgpath, thumbnailyn) VALUES (?, ?, ?, ?, ?)";
                const result = await db.query(query, [feedId, userId, filename, destination, thumbnail]);

                results.push(result);
                thumbnail = 'N';
            }
        }

        res.json({
            message: "success",
            feedId: feedId
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

// [POST] /feed/like
// body: { feedId, userId }
router.post('/like', async (req, res) => {
    const { feedNo, userId } = req.body;

    if (!feedNo || !userId) {
        return res.status(400).json({ message: "feedId와 userId가 필요합니다." });
    }

    try {
        // 중복 좋아요 방지 체크
        const checkQuery = "SELECT * FROM FEED_LIKE WHERE FEEDNO = ? AND USERID = ?";
        const [existing] = await db.query(checkQuery, [feedNo, userId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "이미 좋아요를 누른 게시글입니다." });
        }

        const insertQuery = "INSERT INTO FEED_LIKE (FEEDNO, USERID, REGDATE) VALUES (?, ?, NOW())";
        await db.query(insertQuery, [feedNo, userId]);

        res.json({ message: "좋아요 등록 성공" });
    } catch (err) {
        console.error("좋아요 등록 에러:", err.message);
        res.status(500).send("Server Error");
    }
});

// [DELETE] /feed/like
// body: { feedId, userId }
router.post('/unlike', async (req, res) => {
    const { feedNo, userId } = req.body;

    if (!feedNo || !userId) {
        return res.status(400).json({ message: "feedId와 userId가 필요합니다." });
    }

    try {
        const deleteQuery = "DELETE FROM FEED_LIKE WHERE FEEDNO = ? AND USERID = ?";
        const [result] = await db.query(deleteQuery, [feedNo, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "좋아요가 존재하지 않습니다." });
        }

        res.json({ message: "좋아요 취소 성공" });
    } catch (err) {
        console.error("좋아요 삭제 에러:", err.message);
        res.status(500).send("Server Error");
    }
});

// [GET] /feed/:feedId/likes/count
// 특정 게시글 좋아요 개수 조회
router.get('/:feedNo/likes/count', async (req, res) => {
    const feedNo = req.params.feedNo;

    try {
        const query = "SELECT COUNT(*) AS likeCount FROM FEED_LIKE WHERE FEEDNO = ?";
        const [rows] = await db.query(query, [feedNo]);

        res.json({
            message: "success",
            feedNo,
            likeCount: rows[0].likeCount
        });
    } catch (err) {
        console.error("좋아요 수 조회 에러:", err.message);
        res.status(500).send("Server Error");
    }
});



router.get('/likes/:userId', async (req, res) => {
    let { userId } = req.params;
    try {
        let query = "SELECT * FROM FEED_LIKE WHERE USERID = ?"
        let [Like] = await db.query(query, userId)
        res.json({
            message : "success",
            Like : Like
        })
    } catch (err) {
        console.log("에러 발생!")
        console.log(err.message);
        res.status(500).send("Server Error")
    }
})


module.exports = router;