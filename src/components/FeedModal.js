// components/FeedModal.jsx
import React, { useState } from 'react';
import {
    Modal, Box, Typography, TextField, Button, IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

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
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("contents", content);
        if (files) {
            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
            }
        }

        fetch("http://localhost:3005/feed", {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                console.log("업로드 결과:", data);
                onClose(); // 등록 후 모달 닫기
            });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" gutterBottom>글쓰기</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="무슨 일이 있었나요?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box display="flex" alignItems="center">
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
                    <Typography sx={{ ml: 1 }}>
                        {files ? `${files.length}개 파일 선택됨` : '사진 선택'}
                    </Typography>
                </Box>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSubmit}
                >
                    등록하기
                </Button>
            </Box>
        </Modal>
    );
}

export default FeedModal;
