import { useState } from "react";
import '../styles/FindPassword.css'

function ResetPasswordPage() {
    const [userId, setUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [verified, setVerified] = useState(false);
    const [disabled, setDisabled] = useState(false); // 버튼 비활성화 상태
    const [timer, setTimer] = useState(0); // 타이머 표시용

    const handleVerifyUser = (e) => {
        e.preventDefault();
        fetch("http://localhost:3005/member/verifyUserId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        })
            .then(res => res.json())
            .then(data => {
                setMessage(data.message);
                if (data.success) {
                    setVerified(true);
                }
            })
            .catch(() => setMessage("서버 오류가 발생했습니다."));
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        fetch("http://localhost:3005/member/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, newPassword })
        })
            .then(res => res.json())
            .then(data => {
                setMessage(data.message);

                // 서버에서 너무 자주 변경 메시지 수신 시
                if (data.message.includes("너무 자주 변경")) {
                    setDisabled(true);
                    let seconds = 30;
                    setTimer(seconds);
                    const interval = setInterval(() => {
                        seconds -= 1;
                        setTimer(seconds);
                        if (seconds <= 0) {
                            clearInterval(interval);
                            setDisabled(false);
                            setTimer(0);
                        }
                    }, 1000);
                }
            })
            .catch(() => setMessage("서버 오류가 발생했습니다."));
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-box">
                <h3 className="reset-password-title">비밀번호 재설정</h3>

                <form onSubmit={verified ? handleResetPassword : handleVerifyUser}>
                    <input
                        type="text"
                        className="reset-password-input"
                        placeholder="아이디 입력"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        required
                        disabled={verified}
                    />

                    {verified && (
                        <input
                            type="password"
                            className="reset-password-input"
                            placeholder="새 비밀번호"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            disabled={disabled}
                        />
                    )}

                    <button type="submit" className="reset-password-button" disabled={disabled}>
                        {verified
                            ? (disabled ? `${timer}초 후 다시 시도` : "비밀번호 변경")
                            : "아이디 확인"}
                    </button>
                </form>

                <button className="reset-password-button-success">
                    <a href="/">로그인 창으로 이동</a>
                </button>

                {message && <p className="reset-password-message">{message}</p>}
            </div>
        </div>
    );
}

export default ResetPasswordPage;
