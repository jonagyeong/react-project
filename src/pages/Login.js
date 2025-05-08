import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
    const [userId, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        fetch("http://localhost:3005/member/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ userId, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data != null) {
                    alert(data.message)
                    localStorage.setItem("token", data.token);
                    navigate("/main");
                } else {
                    alert(data.message)
                }
            })
    };

    // floating label 스타일 생성 함수
    const floatingLabelStyle = (focusedOrFilled) => ({
        position: 'absolute',
        left: '12px',
        top: focusedOrFilled ? '4px' : '50%',
        transform: focusedOrFilled ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: focusedOrFilled ? '12px' : '16px',
        color: focusedOrFilled ? '#3897f0' : '#aaa',
        backgroundColor: '#fafafa',
        padding: '0 4px',
        transition: '0.2s ease all',
        pointerEvents: 'none'
    });

    // wrapper div 스타일 생성 함수
    const wrapperStyle = (focused) => ({
        position: 'relative',
        marginBottom: '20px',
        backgroundColor: '#fafafa',
        border: focused ? '2px solid #3897f0' : '1px solid #dbdbdb',
        borderRadius: '4px'
    });

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fafafa'
        }}>
            <div style={{
                width: '400px',
                padding: '60px 40px',
                backgroundColor: '#fff',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h1 style={{ marginBottom: '30px', fontSize: '24px' }}>로그인</h1>

                <form onSubmit={handleLogin}>

                    {/* 아이디 입력 */}
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
                                padding: '18px 12px 6px 12px',  // 위 padding 넉넉히
                                fontSize: '14px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* 비밀번호 입력 */}
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
                                padding: '18px 12px 6px 12px',
                                fontSize: '14px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <button type="submit" style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#3897f0',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}>
                        로그인
                    </button>
                    <div style={{ width: '100%' }}>
                        <a href='/join' style={{ fontWeight: 'bold', color: '#3949ab' }}>회원가입</a>
                        <a href='/' style={{ fontWeight: 'bold', color: '#3949ab' }}>비밀번호 찾기</a>
                    </div>
                    <hr></hr>
                </form>
            </div>
        </div>
    );
}

export default Login;
