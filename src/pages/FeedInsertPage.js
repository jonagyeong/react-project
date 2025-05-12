import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

function FeedInsertPage() {
    const [file, setFile] = useState(null);
    const [location, setLocation] = useState('');
    const navigate = useNavigate();

    const [content, setContent] = useState('');


    const token = localStorage.getItem("token");

    const handleFileChange = (event) => {
        setFile(event.target.files);
    };
    const fnRegister = () => {
        if (!token) {
            navigate('/');
            return;
        }

        if (!file || file.length === 0) {
            alert("이미지를 하나 이상 첨부해야 합니다.");
            return; // 등록 중단
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // 이 값을 주소로 변환하고 싶으면 geocoding API 사용해야 함 (카카오, 네이버, 구글 등)
        });

        const User = jwtDecode(token);
        console.log(User.userId)
        fetch("http://localhost:3005/feed", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                userId: User.userId,
                content: content,
                location: location
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log("피드 등록 성공:", data);
                fnUploadFile(data.result.insertId, User.userId); // insertId로 이미지 업로드
                console.log(data.result.insertId)
            })
            .catch(err => {
                console.error("피드 등록 실패:", err);
            });
    };

    // 이미지 업로드 함수
    const fnUploadFile = (feedId, userId) => {
        const formData = new FormData();
        for (let i = 0; i < file.length; i++) {
            formData.append("file", file[i]);
        }
        formData.append("feedId", feedId);
        formData.append("userId", userId)

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

    // 피드 등록 함수

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
                    <Select defaultValue="" label="카테고리">
                        <MenuItem value={1}>일상</MenuItem>
                        <MenuItem value={2}>여행</MenuItem>
                        <MenuItem value={3}>음식</MenuItem>
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

export default FeedInsertPage;
