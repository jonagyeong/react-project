import React, { useEffect, useState } from 'react';
import {
    Box, Avatar, Typography, Button, Grid, Paper, Dialog,
    DialogActions, DialogContent, DialogTitle, IconButton, TextField
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateIcon from '@mui/icons-material/Create';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import SideNavigation from "../components/SideNavigation";


function MyPage() {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [user, setUser] = useState([]);
    const [feeds, setFeeds] = useState([]);
    const [ImgList, setImgList] = useState([]);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState("");

    const [modalOpen, setModalOpen] = useState(false);


    const my = jwtDecode(localStorage.getItem("token"));
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3005/profile/followers/" + my.userId)
            .then(res => res.json())
            .then(data => setFollowers(data));

        fetch("http://localhost:3005/profile/following/" + my.userId)
            .then(res => res.json())
            .then(data => setFollowing(data));

        fetch("http://localhost:3005/profile/" + my.userId)
            .then(res => res.json())
            .then(data => {
                setUser(data.info);
                setFeeds(data.FeedList);  // 서버에서 피드 리스트 받기
                console.log("피드 리스트:", data.FeedList);  // 디버깅: 피드 리스트 확인
            });
    }, [my.userId]);

    useEffect(() => {
        if (selectedFeed) {
            console.log("선택된 피드:", selectedFeed);  // 디버깅: 선택된 피드 확인
            fetch("http://localhost:3005/feed/images/" + selectedFeed.FEEDNO)
                .then(res => res.json())
                .then(data => {
                    setImgList(data.ImgList);
                    console.log("이미지 리스트:", data.ImgList);  // 디버깅: 이미지 리스트 확인
                });
        }
    }, [selectedFeed]);

    const handleOpenDetail = (feed) => {
        console.log("피드 클릭됨:", feed);  // 디버깅: 클릭된 피드 확인
        setSelectedFeed(feed);  // 클릭한 피드를 selectedFeed로 설정
        setEditedContent(feed.content);  // 초기 값으로 피드 내용 설정
        setOpenDetail(true);  // 상세 보기 창 열기
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedFeed(null);
        setIsEditMode(false);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleDeleteFeed = (feedNo) => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            fetch("http://localhost:3005/feed/" + feedNo, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        setFeeds(prev => prev.filter(feed => feed.FEEDNO !== feedNo));
                        handleCloseDetail();
                    } else {
                        alert("삭제에 실패했습니다.");
                    }
                })
                .catch(err => {
                    console.error("삭제 에러:", err);
                });
        }
    };

    const handleEditFeed = () => {
        fetch("http://localhost:3005/feed/" + selectedFeed.FEEDNO, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: editedContent })
        })
            .then(response => {
                if (response.ok) {
                    const updatedFeed = { ...selectedFeed, content: editedContent };
                    setFeeds(prev => prev.map(feed => feed.FEEDNO === updatedFeed.FEEDNO ? updatedFeed : feed));
                    setSelectedFeed(updatedFeed);
                    setIsEditMode(false);
                } else {
                    alert("수정에 실패했습니다.");
                }
            })
            .catch(err => {
                console.error("수정 에러:", err);
            });
    };



    return (
        <Box sx={{ display: 'flex' }}>
            <SideNavigation handleOpenModal={handleOpenModal} />

            <Box sx={{ marginLeft: '200px', padding: '20px', width: '100%' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center',
                    marginBottom: '20px', backgroundColor: '#fff',
                    padding: '20px', borderRadius: '8px',
                    justifyContent: 'center', margin: '0 auto', maxWidth: '800px'
                }}>
                    <Avatar src="https://via.placeholder.com/150" sx={{ width: 150, height: 150, marginRight: '20px' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">{my.userId}</Typography>
                        <Typography variant="body2" color="textSecondary">{my.userName}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '200px' }}>
                            <Typography variant="body2"><strong>{followers.length}</strong> 팔로워</Typography>
                            <Typography variant="body2"><strong>{following.length}</strong> 팔로우</Typography>
                        </Box>
                        <Button variant="contained" color="primary" sx={{ marginTop: '10px' }}>팔로우</Button>
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                    {feeds.length > 0 ? (
                        feeds.map((feed, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper sx={{
                                    width: '100%', height: 250,
                                    backgroundColor: '#e4e4e4',
                                    marginBottom: '20px', overflow: 'hidden'
                                }}>
                                    <img
                                        src={`http://localhost:3005/feed/${feed.IMGNAME}`}
                                        alt={`Post ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onClick={() => handleOpenDetail(feed)}  // 클릭 시 feed 내용 보기
                                    />
                                </Paper>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body2">게시물이 없습니다.</Typography>
                    )}
                </Grid>

                <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <IconButton edge="end" onClick={handleCloseDetail}><CloseIcon /></IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                            <Carousel showThumbs={false}>
                                {ImgList && ImgList.length > 0 ? (
                                    ImgList.map((image, index) => (
                                        <div key={index}>
                                            <img src={`http://localhost:3005/${image.IMGPATH}${image.IMGNAME}`} alt={`Feed Image ${index + 1}`} />
                                        </div>
                                    ))
                                ) : (
                                    <Typography variant="body2">이미지가 없습니다.</Typography>
                                )}
                            </Carousel>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{selectedFeed?.userId}</Typography>
                            <Typography variant="body2" color="textSecondary">{selectedFeed?.date}</Typography>

                            {isEditMode ? (
                                <>
                                    <TextField
                                        fullWidth
                                        multiline
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        sx={{ mt: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Button variant="contained" color="primary" onClick={handleEditFeed}>수정 완료</Button>
                                        <Button variant="outlined" onClick={() => setIsEditMode(false)}>취소</Button>
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body1" sx={{ mt: 2 }}>{selectedFeed?.content}</Typography>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        {!isEditMode && (
                            <>
                                <Button onClick={() => handleDeleteFeed(selectedFeed.FEEDNO)} color="secondary" variant="outlined">삭제</Button>
                                <Button onClick={() => setIsEditMode(true)} color="primary" variant="contained">수정</Button>
                            </>
                        )}
                        <Button onClick={handleCloseDetail}>닫기</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default MyPage;
