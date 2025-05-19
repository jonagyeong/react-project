// jwt 토큰을 검증하는 곳.
// 미들웨어 : 콜백함수 실행하기 전에 실행되는 것

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'test-test'; // .env 없이 하드코딩

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded)
        req.user = decoded; // 이후 라우터에서 req.user로 사용자 정보 사용 가능
        next(); // 미들웨어인 authMiddleware가 끝나면 그 다음 anysc부터 다시 실행해줌
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};