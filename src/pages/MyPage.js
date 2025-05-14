import React, { useEffect, useState } from 'react';
import {
    Box, Avatar, Typography, Button, Grid, Paper, Dialog,
    DialogActions, DialogContent, DialogTitle, IconButton, TextField
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import SettingsIcon from '@mui/icons-material/Settings';


import SideNavigation from "../components/SideNavigation";
import FeedModal from '../components/FeedModal'
import FeedDetailModal from '../components/FeedDetailModal';


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
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleFeedClick = (feed) => {
        setSelectedFeed(feed);
    };

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
                // 디버깅: 피드 리스트 확인
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h5" fontWeight="bold">@{my.userId}</Typography>
                            <IconButton
                                onClick={() => navigate('/settingpage')}
                                sx={{ ml: 1 }}
                                fontSize = '10px'
                                aria-label="설정"
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color="textSecondary">{my.userName}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '200px' }}>
                            <Typography variant="body2"><strong>{followers.length}</strong> 팔로워</Typography>
                            <Typography variant="body2"><strong>{following.length}</strong> 팔로우</Typography>
                        </Box>

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
                                        onClick={() => handleFeedClick(feed)}  // 클릭 시 feed 내용 보기
                                    />
                                </Paper>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body2">게시물이 없습니다.</Typography>
                    )}
                </Grid>

                <FeedModal open={modalOpen} onClose={handleCloseModal} />

                {selectedFeed && (
                    <FeedDetailModal
                        open={Boolean(selectedFeed)}
                        onClose={() => setSelectedFeed(null)}
                        selectedFeed={selectedFeed}
                        feeds={feeds}
                    />
                )}
            </Box>
        </Box>
    );
}

export default MyPage;
