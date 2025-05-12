// components/FeedModal.js
// 연결 테스트 커밋
import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Container,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

function FeedModal({ open, onClose }) {
    const [file, setFile] = useState(null); // 파일
    const [content, setContent] = useState(''); // 내용
    const [location, setLocation] = useState(''); // 위치
    const [visible_scope, setVisibleScope] = useState("ALL"); // 공개 상태
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files);
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

    const fnRegister = () => {
        if (!token) {
            navigate('/');
            return;
        }

        if (!file || file.length === 0) {
            alert("이미지를 하나 이상 첨부해야 합니다.");
            return; // 등록 중단
        }

        // 위치 정보 얻기
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // 위치를 주소로 변환 (예: 카카오 또는 구글 API 사용)
                const locationName = await getAddressFromCoordinates(lat, lng); // 위치 변환 함수

                const User = jwtDecode(token);
                console.log(User.userId);

                fetch("http://localhost:3005/feed", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: User.userId,
                        content: content,
                        location: locationName || location, // 주소가 있으면 사용, 없으면 기존 위치 사용
                        visible_scope: visible_scope
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("피드 등록 성공:", data);
                        fnUploadFile(data.result.insertId, User.userId); // insertId로 이미지 업로드
                        console.log(data.result.insertId);
                    })
                    .catch(err => {
                        console.error("피드 등록 실패:", err);
                    });
            },
            (err) => {
                console.error("위치 정보를 받아오는 데 실패했습니다.", err);
            }
        );
    };

    // 이미지 업로드 함수
    const fnUploadFile = (feedId, userId) => {
        const formData = new FormData();
        for (let i = 0; i < file.length; i++) {
            formData.append("file", file[i]);
        }
        formData.append("feedId", feedId);
        formData.append("userId", userId);

        fetch("http://localhost:3005/feed/upload", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                console.log("이미지 업로드 성공:", data);
                navigate("/main"); // 업로드 후 이동 (필요 시)
            })
            .catch(err => {
                console.error("파일 업로드 실패:", err);
            });
    };

    // 주소 변환 함수 (카카오/구글 API 사용)
    const getAddressFromCoordinates = async (lat, lng) => {
        // 예시: 카카오 또는 구글 API 호출
        // 카카오 예시: axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`, { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } })
        return `${lat}, ${lng}`; // 실제로 주소 변환 API 호출 후 결과 반환
    };

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                minHeight="100vh"
                sx={{ padding: '20px' }}
            >
                <Typography variant="h4" gutterBottom>
                    피드 등록
                </Typography>

                <FormControl fullWidth margin="normal">
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        value={visible_scope}
                        onChange={(e) => setVisibleScope(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="ALL">전체</MenuItem>
                        <MenuItem value="FRIEND">친한 친구만</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="내용"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <TextField
                    label="위치 (선택)"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <Box display="flex" alignItems="center" margin="normal" fullWidth>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                    />
                    <label htmlFor="file-upload">
                        <IconButton color="primary" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>

                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                        {file ? `${file.length}개 파일 선택됨` : '첨부할 파일 선택'}
                    </Typography>
                </Box>

                <Button
                    onClick={fnRegister}
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '20px' }}
                >
                    등록하기
                </Button>
            </Box>
        </Container>
    );
}

export default FeedModal;
