import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Typography, Box, Button, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Carousel } from 'react-responsive-carousel';

function FeedDetailModal({
    open,
    onClose,
    selectedFeed,
    handleEditFeed,
    handleDeleteFeed,
    isEditMode,
    setIsEditMode
}) {
    const [editedContent, setEditedContent] = useState(selectedFeed?.content);
    const [imgList, setImgList] = useState([]); // 이미지 리스트 상태
    const [hashtags, setHashtags] = useState([]);

    useEffect(() => {
        if (selectedFeed) {
            setEditedContent(selectedFeed.content);

            // 이미지 리스트 가져오기
            fetch("http://localhost:3005/feed/images/" + selectedFeed.FEEDNO)
                .then(res => res.json())
                .then(data => {
                    setImgList(data.ImgList || []);
                })
                .catch(err => {
                    console.error("이미지 가져오기 실패:", err);
                });
            fetch("http://localhost:3005/feed/hashtags/" + selectedFeed.FEEDNO)
                .then(res => res.json())
                .then(data => {
                    setHashtags(data.hashTags || [])
                })
        }
    }, [selectedFeed]);

    const handleContentChange = (e) => {
        setEditedContent(e.target.value);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {selectedFeed ? (
                <>
                    <DialogTitle>
                        <Box display="flex" justifyContent="flex-end" alignItems="center">
                            <IconButton edge="end" onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                            <Carousel showThumbs={false}>
                                {imgList.length > 0 ? (
                                    imgList.map((image, index) => {
                                        const imageUrl = `http://localhost:3005/${image.IMGPATH}${image.IMGNAME}`;
                                        return (
                                            <div key={index}>
                                                <img
                                                    src={imageUrl}
                                                    alt={`Feed Image ${index + 1}`}
                                                    onError={(e) => (e.target.src = "/default-image.png")}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <Typography variant="body2">이미지가 없습니다.</Typography>
                                )}
                            </Carousel>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{selectedFeed.userId}</Typography>
                            <Typography variant="body2" color="textSecondary">{selectedFeed.date}</Typography>

                            <>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    {selectedFeed.CONTENT || "내용 없음"}
                                </Typography>

                                {/* 해시태그 표시 */}
                                <Box sx={{ mt: 1 }}>
                                    {hashtags.map((tagObj, index) => (
                                        <span key={index} style={{ color: "#1da1f2", marginRight: "8px" }}>
                                            #{tagObj.TAG}
                                        </span>
                                    ))}
                                </Box>
                            </>

                            
                        </Box>
                    </DialogContent>
                </>
            ) : (
                <Typography variant="body2">선택된 피드가 없습니다.</Typography>
            )}
        </Dialog>
    );
}

export default FeedDetailModal;
