import React, { useEffect, useState } from 'react';
import {
    Box, Avatar, Typography, Button, Grid, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useSearchParams } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';

import SideNavigation from "../components/SideNavigation";
import FeedModal from '../components/FeedModal';
import FeedDetailModal from '../components/FeedDetailModal';

function OtherPage() {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [user, setUser] = useState([]);
    const [feeds, setFeeds] = useState([]);
    const [ImgList, setImgList] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [followRequestStatus, setFollowRequestStatus] = useState('');
    const [showFollowerModal, setShowFollowerModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const otherUserId = searchParams.get("userId");

    const my = jwtDecode(localStorage.getItem("token"));

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    const handleFeedClick = (feed) => setSelectedFeed(feed);

    // 팔로우 상태 체크
    const checkFollowStatus = () => {
        if (!otherUserId || otherUserId === my.userId) return;

        const FollowCheck = {
            fromUserId: my.userId,
            toUserId: otherUserId
        };

        fetch("http://localhost:3005/follow/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(FollowCheck)
        })
            .then(res => res.json())
            .then(data => {
                setIsFollowing(data.follow);
                setFollowRequestStatus(data.status);
            });
    };

    // 팔로워/팔로잉 데이터 가져오기
    const fetchFollowersAndFollowing = () => {
        if (!otherUserId) return;

        fetch("http://localhost:3005/profile/followers/" + otherUserId)
            .then(res => res.json())
            .then(data => setFollowers(data));

        fetch("http://localhost:3005/profile/following/" + otherUserId)
            .then(res => res.json())
            .then(data => setFollowing(data));
    };

    useEffect(() => {
        checkFollowStatus();

        fetch("http://localhost:3005/profile/" + otherUserId)
            .then(res => res.json())
            .then(data => {
                setIsPrivate(data.private === 'Y');
                setUser(data.info || {});
                setFeeds(data.FeedList || []);
            });

        fetchFollowersAndFollowing();
    }, [otherUserId, my.userId]);

    useEffect(() => {
        if (selectedFeed) {
            fetch("http://localhost:3005/feed/images/" + selectedFeed.FEEDNO)
                .then(res => res.json())
                .then(data => setImgList(data.ImgList));
        }
    }, [selectedFeed]);

    const handleFollowToggle = async () => {
        const url = isFollowing
            ? "http://localhost:3005/follow/unfollow"
            : "http://localhost:3005/follow";

        const body = {
            fromUserId: my.userId,
            toUserId: otherUserId
        };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json().catch(() => ({}));

            if (!isFollowing) {
                if (data.status === 'ACCEPTED') {
                    setIsFollowing(true);
                    setFollowRequestStatus('');
                } else if (data.status === 'PENDING') {
                    setFollowRequestStatus('PENDING');
                }
            } else {
                setIsFollowing(false);
                setFollowRequestStatus('');
            }
        } catch (error) {
            console.error("Follow toggle error:", error);
        }
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h5" fontWeight="bold">@{otherUserId}</Typography>
                            {otherUserId === my.userId && (
                                <IconButton
                                    onClick={() => navigate('/settingpage')}
                                    sx={{ ml: 1 }}
                                    fontSize='10px'
                                    aria-label="설정"
                                >
                                    <SettingsIcon />
                                </IconButton>
                            )}
                        </Box>
                        <Typography variant="body2" color="textSecondary">{user.USERNAME}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '200px' }}>
                            <Typography
                                variant="body2"
                                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setShowFollowerModal(true)}
                            >
                                <strong>{followers.length}</strong> 팔로워
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setShowFollowingModal(true)}
                            >
                                <strong>{following.length}</strong> 팔로우
                            </Typography>
                        </Box>

                        {otherUserId !== my.userId && (
                            <Button
                                variant={followRequestStatus === 'PENDING' ? "outlined" : isFollowing ? "outlined" : "contained"}
                                color="primary"
                                onClick={handleFollowToggle}
                                sx={{ mt: 2 }}
                                disabled={followRequestStatus === 'PENDING'}
                            >
                                {followRequestStatus === 'PENDING' ? "요청중" : isFollowing ? "언팔로우" : "팔로우"}
                            </Button>
                        )}
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
                                        src={"http://localhost:3005/feed/" + feed.IMGNAME}
                                        alt={"Post " + (index + 1)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onClick={() => handleFeedClick(feed)}
                                    />
                                </Paper>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body2">게시물이 없습니다.</Typography>
                    )}
                </Grid>

                {/* 팔로워 모달 */}
                <Dialog open={showFollowerModal} onClose={() => setShowFollowerModal(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>팔로워</DialogTitle>
                    <DialogContent dividers>
                        {followers.length === 0 ? (
                            <Typography>팔로워가 없습니다.</Typography>
                        ) : (
                            followers.map((follower) => (
                                <Box key={follower.USERID} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar src={follower.PROFILEIMG || "https://via.placeholder.com/40"} />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle2">@{follower.USERID}</Typography>
                                        <Typography variant="body2">{follower.USERNAME}</Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowFollowerModal(false)}>닫기</Button>
                    </DialogActions>
                </Dialog>

                {/* 팔로잉 모달 */}
                <Dialog open={showFollowingModal} onClose={() => setShowFollowingModal(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>팔로우</DialogTitle>
                    <DialogContent dividers>
                        {following.length === 0 ? (
                            <Typography>팔로우 중인 사용자가 없습니다.</Typography>
                        ) : (
                            following.map((follow) => (
                                <Box key={follow.USERID} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar src={follow.PROFILEIMG || "https://via.placeholder.com/40"} />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle2">@{follow.USERID}</Typography>
                                        <Typography variant="body2">{follow.USERNAME}</Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowFollowingModal(false)}>닫기</Button>
                    </DialogActions>
                </Dialog>

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

export default OtherPage;
