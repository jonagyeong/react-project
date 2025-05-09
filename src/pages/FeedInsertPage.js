import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function FeedInsertPage() {
    const [files, setFile] = useState(null);
    const [contents, setContents] = useState('');
    const [location, setLocation] = useState('');
    const [scope, setScope] = useState('');
    const [visible_scope, setvisible_scope] = useState('Y'); // 예시로 'Y'로 설정

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // 파일 저장
    };

    let user = null;
        const token = localStorage.getItem("token");
        if (token) {
            try {
                user = jwtDecode(token);
            } catch (err) {
                console.error("토큰 디코딩 실패:", err);
            }
        }


    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('file', files); // 파일 추가
        formData.append('userId', user.userId); // 예시로 userId를 'user123'으로 설정
        formData.append('contents', contents); // 게시글 내용
        formData.append('location', location); // 위치
        formData.append('visible_scope', visible_scope); // 게시글 공개 여부

        try {
            const response = await axios.post('http://localhost:3005/feed', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // 멀티파트 폼 데이터 설정
                },
            });
            console.log('게시글 업로드 성공:', response.data);
        } catch (err) {
            console.error('게시글 업로드 실패:', err);
        }
    };

    return (
        <div>
            <h2>게시글 작성</h2>
            <textarea
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                placeholder="내용을 입력하세요"
            />
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="위치를 입력하세요 (선택)"
            />
            <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="범위 설정 (선택)"
            />
            <input
                type="file"
                onChange={handleFileChange}
                required
                multiple
            />
            <button onClick={handleSubmit}>게시글 올리기</button>
        </div>
    );
}

export default FeedInsertPage;
