import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Login.css'; // 스타일 분리 권장

function Login() {
    const [userId, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        fetch("http://52.78.184.181:3005/member/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ userId, password })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data?.token) {
                    localStorage.setItem("token", data.token);
                    navigate("/main");
                }
            });
    };

    const floatingLabelStyle = (focusedOrFilled) => ({
        position: 'absolute',
        left: '12px',
        top: focusedOrFilled ? '6px' : '50%',
        transform: focusedOrFilled ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: focusedOrFilled ? '12px' : '14px',
        color: focusedOrFilled ? '#3897f0' : '#aaa',
        backgroundColor: '#fafafa',
        padding: '0 4px',
        transition: '0.2s ease all',
        pointerEvents: 'none'
    });

    const wrapperStyle = (focused) => ({
        position: 'relative',
        marginBottom: '20px',
        backgroundColor: '#fafafa',
        border: focused ? '2px solid #3897f0' : '1px solid #dbdbdb',
        borderRadius: '4px'
    });

    return (
        <div className="login-container">
            <div className="login-form-section">
                <div className="login-box">
                    <h3 className="login-title">로그인</h3>
                    <form onSubmit={handleLogin}>
                        <div style={wrapperStyle(isUsernameFocused)}>
                            <label style={floatingLabelStyle(isUsernameFocused || userId)}>
                                아이디
                            </label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setIsUsernameFocused(true)}
                                onBlur={() => setIsUsernameFocused(false)}
                                style={{
                                    width: '100%',
                                    height: '40px', // 고정 높이 추가
                                    padding: '16px 12px 4px 12px', // 위 padding을 키우고 아래 줄임
                                    fontSize: '14px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    boxSizing: 'border-box'
                                  }}
                            />
                        </div>
                        <div style={wrapperStyle(isPasswordFocused)}>
                            <label style={floatingLabelStyle(isPasswordFocused || password)}>
                                비밀번호
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                style={{
                                    width: '100%',
                                    height: '40px', // 고정 높이 추가
                                    padding: '16px 12px 4px 12px', // 위 padding을 키우고 아래 줄임
                                    fontSize: '14px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    boxSizing: 'border-box'
                                  }}
                            />
                        </div>
                        <button type="submit" className="login-button">로그인</button>
                    </form>

                    <div className="login-links">
                        <a href='/join'>회원가입</a>
                        <a href='/resetpasssword'>비밀번호 찾기</a>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Login;
