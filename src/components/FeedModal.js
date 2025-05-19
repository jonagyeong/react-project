import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
    Modal,
    Avatar
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 600,
    bgcolor: 'white',
    borderRadius: '12px',
    boxShadow: 24,
    zIndex: 1300,
    p: 0,
    overflow: 'hidden',
};

function FeedModal({ open, onClose, editMode, editingFeed }) {
    const [file, setFile] = useState(null);
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [visible_scope, setVisibleScope] = useState("ALL");
    const navigate = useNavigate();

    useEffect(() => {
        if (editMode && editingFeed) {
            console.log("Editing feed: ", editingFeed);
            setContent(editingFeed.content);
            setLocation(editingFeed.location || '');
            setVisibleScope(editingFeed.visible_scope || 'ALL');
        }
    }, [editMode, editingFeed]);

    const handleFileChange = (e) => {
        setFile(e.target.files);
    };

    const handleModalClose = () => {
        setFile(null);
        setContent('');
        setLocation('');
        setVisibleScope("ALL");
        onClose(); // 부모 컴포넌트에서 받은 onClose 호출
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
            alert("이미지를 선택하세요.");
            return;
        }

        const User = jwtDecode(token);

        const feedData = {
            userId: User.userId,
            content,
            visible_scope,
            location
        };

        const url = editMode ? "http://localhost:3005/feed/" + editingFeed.id : "http://localhost:3005/feed";
        const method = editMode ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(feedData)
        })
            .then(res => res.json())
            .then(data => {
                console.log(editMode ? "피드 수정 성공:" : "피드 등록 성공:", data);
                if (editMode) {
                    onClose(); // 수정 후 모달 닫기
                    navigate("/main"); // 원하는 페이지로 이동
                } else {
                    fnUploadFile(data.result.insertId, User.userId); // 새 피드 등록 후 이미지 업로드
                }
            })
            .catch(err => {
                console.error("피드 처리 실패:", err);
            });
    };

    const fnUploadFile = (feedId, userId) => {
        if (!file || file.length === 0) {
            onClose();
            return;
        }

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
                onClose();  // 모달 닫기
                navigate("/main"); // 원하는 페이지로 이동
            })
            .catch(err => {
                console.error("파일 업로드 실패:", err);
            });
    };

    return (
        <Modal open={open} onClose={onClose} sx={{zIndex:1500}}>
            <Box sx={style}>
                <Box display="flex" height="100%">
                    <IconButton
                        onClick={handleModalClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* 왼쪽: 이미지 미리보기 */}
                    <Box sx={{ flex: 1, backgroundColor: '#f0f0f0' }}>
                        {file && file.length > 0 ? (
                            <img
                                src={URL.createObjectURL(file[0])}
                                alt="미리보기"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : editMode && editingFeed?.thumbnail ? (
                            <img
                                src={`http://localhost:3005/${editingFeed.thumbnail}`}
                                alt="기존 이미지"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                height="100%"
                                color="gray"
                            >
                                이미지 미리보기
                            </Box>
                        )}
                    </Box>

                    {/* 오른쪽: 텍스트 필드 및 버튼 */}
                    <Box sx={{ flex: 1.2, p: 3, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            {editMode ? "게시물 수정" : "새 게시물 만들기"}
                        </Typography>

                        {user && (
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar
                                    src={"/default-profile.png"}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                />
                                <Typography variant="body1" fontWeight="bold">
                                    {user.userId}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            placeholder="문구를 입력하세요..."
                            multiline
                            rows={5}
                            fullWidth
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            placeholder="위치 추가"
                            fullWidth
                            size="small"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>공개 범위</InputLabel>
                            <Select
                                value={visible_scope}
                                onChange={(e) => setVisibleScope(e.target.value)}
                            >
                                <MenuItem value="ALL">전체</MenuItem>
                                <MenuItem value="FRIEND">친한 친구만</MenuItem>
                            </Select>
                        </FormControl>

                        <Box display="flex" alignItems="center" mb={2}>
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
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                {file ? `${file.length}개 파일 선택됨` : '파일을 선택하세요'}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={fnRegister}
                            fullWidth
                            sx={{ mt: 'auto' }}
                        >
                            {editMode ? "수정하기" : "공유하기"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

export default FeedModal;
