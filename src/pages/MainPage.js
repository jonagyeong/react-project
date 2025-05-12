import React, { useState, useEffect } from "react";
import {
    Box, Typography, TextField, Button, Avatar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Snackbar, Card, CardHeader, CardMedia, CardContent, IconButton
} from "@mui/material";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';

import FriendRecommendations from "../components/FriendRecommendations";
import FeedModal from '../components/FeedModal';
import SideNavigation from "../components/SideNavigation";

function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [feeds, setFeeds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
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

    const fnFeedList = () => {
        fetch("http://localhost:3005/feed/list")
            .then(res => res.json())
            .then(data => {
                setFeeds(data.list);
                console.log(data.list);
            });
    };

    useEffect(() => {
        fnFeedList();
    }, []);

    const getRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diff = Math.floor((now - past) / 1000);
        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setSnackOpen(true);
        setDialogOpen(false);
        setTimeout(() => {
            navigate("/");
        }, 1500);
    };

    return (
        <Box display="flex">
            <SideNavigation handleOpenModal={handleOpenModal} />

            <Box
                flex={1}
                p={3}
                sx={{
                    marginLeft: "200px",
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ width: "100%", maxWidth: 400 }}>
                    {feeds.length === 0 ? (
                        <Typography variant="body2">피드를 불러오는 중입니다...</Typography>
                    ) : (
                        feeds.map((feed, index) => (
                            <Card key={index} sx={{ marginBottom: 4 }}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                                            {feed.USERID ? feed.USERID.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                    }
                                    title={
                                        <Typography variant="subtitle1">
                                            @{feed.USERID} <span style={{ color: '#999' }}>· {getRelativeTime(feed.REGDATE)}</span>
                                        </Typography>
                                    }
                                />
                                {feed.IMGNAME && (
                                    <CardMedia
                                        component="img"
                                        height="400"
                                        image={`http://localhost:3005/feed/${feed.IMGNAME}`}
                                        alt="피드 이미지"
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                                        {feed.contents}
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <IconButton><FavoriteIcon color="error" /></IconButton>
                                        <IconButton><ShareIcon /></IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>

                {searchOpen && (
                    <Box mt={3}>
                        <TextField variant="outlined" label="검색" fullWidth />
                    </Box>
                )}
            </Box>

            {user && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        zIndex: 1301
                    }}
                >
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                            src={user.profileImg || "/default-profile.png"}
                            alt={user.userName}
                            sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box mr={2}>
                            <Typography variant="body2"><strong>{user.userId}</strong></Typography>
                            <Typography variant="caption" color="textSecondary">{user.userName}</Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setDialogOpen(true)}
                        >
                            로그아웃
                        </Button>
                    </Box>
                    <Box>
                        <FriendRecommendations user={user} />
                    </Box>
                </Box>
            )}
            
            <FeedModal open={modalOpen} handleClose={handleCloseModal} />

            {/* ✅ Dialog 컴포넌트 수정됨 */}
            <Dialog>
                <DialogTitle>로그아웃 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        정말 로그아웃하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>취소</Button>
                    <Button onClick={handleLogout} color="error">로그아웃</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackOpen}
                autoHideDuration={2000}
                onClose={() => setSnackOpen(false)}
                message="로그아웃 되었습니다."
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 1301 }}
            />
        </Box>
    );
}

export default MainPage;
