import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Typography, Box, Button, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Carousel } from 'react-responsive-carousel';

import FeedModal from './FeedModal';
import { getTimeAgo } from './TimeAgo';

function FeedDetailModal({
    open,
    onClose,
    selectedFeed,
    feeds
}) {
    const [editedContent, setEditedContent] = useState(selectedFeed?.CONTENT);
    const [imgList, setImgList] = useState([]); // 이미지 리스트 상태
    const [hashtags, setHashtags] = useState([]);
    const [menuFeedId, setMenuFeedId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // ✅ anchorEl 상태 추가
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingFeed, setEditingFeed] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);


    const fnInfoList = () => {
        // 이미지 + 피드 리스트 가져오기
        fetch("http://localhost:3005/feed/images/" + selectedFeed.FEEDNO)
            .then(res => res.json())
            .then(data => {
                setImgList(data.ImgList || []);
            })
            .catch(err => {
                console.error("이미지 가져오기 실패:", err);
            });
    }

    useEffect(() => {
        if (selectedFeed) {
            setEditedContent(selectedFeed.content);

            fetch("http://localhost:3005/feed/hashtags/" + selectedFeed.FEEDNO)
                .then(res => res.json())
                .then(data => {
                    setHashtags(data.hashTags || [])
                })
            fnInfoList();
        }
    }, [selectedFeed]);


    const handleContentChange = (e) => {
        setEditedContent(e.target.value);
    };

    const handleMenuOpen = (feeds, event) => {
        setMenuFeedId(feeds.FEEDNO);
        setMenuOpen(true); // 팝업 열기
        setAnchorEl(event.currentTarget);// ✅ 클릭된 요소를 anchor로 지정
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuOpen(false); // 팝업 닫기
        setMenuFeedId(null);
    };

    const handleDeleteFeed = (feedId) => {
        if (!window.confirm("삭제하시겠습니까?")) {
            handleMenuClose();
            return;
        }
        fetch("http://localhost:3005/feed/" + feedId, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(data => {
                alert("삭제 완료!")
                onClose();
                handleMenuClose();
            })
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth={true}>
            {selectedFeed ? (
                <>
                    <DialogTitle>
                        <Box display="flex" justifyContent="flex-end" alignItems="center">
                            <IconButton onClick={(e) => { e.stopPropagation(); handleMenuOpen(selectedFeed, e); }}>
                                <Typography fontSize="24px">⋯</Typography>
                            </IconButton>
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
                            <Typography variant="h6">{selectedFeed.USERID}</Typography>
                            <Typography variant="body2" color="textSecondary">{getTimeAgo(selectedFeed.REGDATE)}</Typography>

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
                    <Dialog open={menuOpen} onClose={handleMenuClose}>
                        <DialogContent
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '16px',
                                minWidth: '280px'
                            }}
                        >
                            <Button fullWidth onClick={() => {
                                if (!feeds || !Array.isArray(feeds)) {
                                    alert("피드 데이터가 로드되지 않았습니다.");
                                    return;
                                }

                                const feedToEdit = feeds.find(f => f.FEEDNO === menuFeedId);

                                if (!feedToEdit) {
                                    alert("수정할 피드를 찾을 수 없습니다.");
                                    return;
                                }

                                const convertedFeed = {
                                    id: feedToEdit.FEEDNO,
                                    content: feedToEdit.CONTENT,
                                    location: feedToEdit.LOCATION,
                                    visible_scope: feedToEdit.VISIBLE_SCOPE,
                                    thumbnail: feedToEdit.IMGPATH + feedToEdit.IMGNAME
                                };

                                console.log("convertedFeed ==> ", convertedFeed);
                                setEditingFeed(convertedFeed);
                                setEditMode(true);
                                setModalOpen(true);
                                handleMenuClose();
                            }}>
                                수정
                            </Button>



                            <Button fullWidth onClick={() => {
                                handleDeleteFeed(menuFeedId);
                            }} style={{ color: "red" }}>삭제</Button>
                            <Button fullWidth onClick={handleMenuClose} style={{ marginTop: '8px', color: 'gray' }}>
                                취소
                            </Button>
                        </DialogContent>
                    </Dialog>
                    {modalOpen && (
                        <FeedModal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            feed={editingFeed}
                        />
                    )}
                </>
            ) : (
                <Typography variant="body2">선택된 피드가 없습니다.</Typography>
            )}
        </Dialog>
    );
}

export default FeedDetailModal;
