import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Join() {
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState({
        userId: '',
        email: '',
    });

    const navigate = useNavigate();

    const inputStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '10px',
        fontSize: '14px',
        border: '1px solid #dbdbdb',
        borderRadius: '4px',
        boxSizing: 'border-box'
    };
    
    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#3897f0',
        border: 'none',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px'
    };

    const handleJoin = (e) => {
        e.preventDefault();
        console.log(userId, email, password, userName);
        fetch("http://localhost:3005/member/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, email, password, userName })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === "회원가입 완료") {
                    alert(data.message);
                    navigate("/");
                } else {
                    // 서버에서 어떤 오류 메시지를 보냈는지 확인해서 보여줌
                    if (data.message.includes("아이디")) {
                        setError(prev => ({ ...prev, userId: data.message }));
                    } else if (data.message.includes("이메일")) {
                        setError(prev => ({ ...prev, email: data.message }));
                    }
                }
            })
            .catch(err => {
                alert("서버 오류가 발생했습니다.");
                console.error(err);
            });
    };

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
                <h1 style={{ marginBottom: '30px', fontSize: '24px' }}>회원가입</h1>

                <form onSubmit={handleJoin}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={userId}
                        onChange={(e) => {
                            setUserId(e.target.value);
                            setError(prev => ({ ...prev, userId: '' })); // 아이디 수정 시 오류 메시지 제거
                        }}
                        required
                        style={inputStyle}
                    />
                    {error.userId && <div style={{ color: 'red', fontSize: '12px' }}>{error.userId}</div>}

                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError(prev => ({ ...prev, email: '' })); // 이메일 수정 시 오류 메시지 제거
                        }}
                        required
                        style={inputStyle}
                    />
                    {error.email && <div style={{ color: 'red', fontSize: '12px' }}>{error.email}</div>}

                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="이름"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>가입하기</button>
                </form>
            </div>
        </div>
    );
}



export default Join;
