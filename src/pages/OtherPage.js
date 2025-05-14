import React, { useEffect, useState } from 'react';
import {
    Box, Avatar, Typography, Button, Grid, Paper, IconButton
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
    const [isFollowing, setIsFollowing] = useState(false); // 팔로우 상태
    const [isPrivate, setIsPrivate] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [followRequestStatus, setFollowRequestStatus] = useState(''); // 팔로우 요청 상태 추가

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const otherUserId = searchParams.get("userId");

    const my = jwtDecode(localStorage.getItem("token"));

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);
    const handleFeedClick = (feed) => setSelectedFeed(feed);

    const checkFollowStatus = () => {
        if (!otherUserId || otherUserId === my.userId) return;

        const FollowCheck = {
            fromUserId: my.userId, // 나의 userId를 from으로
            toUserId: otherUserId
        };

        fetch("http://localhost:3005/follow/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(FollowCheck)
        })
            .then(res => res.json())
            .then(data => {
                setIsFollowing(data.follow); // 팔로우 상태 설정
                setFollowRequestStatus(data.status); // 요청 상태 설정
            });
    };

    // 최초 로딩 시 팔로우 상태 확인
    useEffect(() => {
        checkFollowStatus();

        fetch("http://localhost:3005/follow/other/" + otherUserId)
            .then(res => res.json())
            .then(data => {
                setIsPrivate(data.private === 'Y');
            });
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
            ? "http://localhost:3005/follow/unfollow" // 언팔로우
            : "http://localhost:3005/follow";          // 팔로우

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

            const data = await res.json().catch(() => ({})); // handle empty body on unfollow

            if (!isFollowing) {
                if (data.status === 'ACCEPTED') {
                    setIsFollowing(true); // 팔로우 성공 시 상태를 true로
                    setFollowRequestStatus(''); // 요청이 수락되었으므로 요청 상태 초기화
                } else if (data.status === 'PENDING') {
                    setFollowRequestStatus('PENDING'); // 요청 상태 'PENDING'으로 변경
                }
            } else {
                setIsFollowing(false); // 언팔로우 후 상태를 false로
                setFollowRequestStatus(''); // 요청 상태 초기화
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
                            <Typography variant="body2"><strong>{followers.length}</strong> 팔로워</Typography>
                            <Typography variant="body2"><strong>{following.length}</strong> 팔로우</Typography>
                        </Box>

                        {otherUserId !== my.userId && (
                            <Button
                                variant={followRequestStatus === 'PENDING' ? "outlined" : isFollowing ? "outlined" : "contained"}
                                color="primary"
                                onClick={handleFollowToggle}
                                sx={{ mt: 2 }}
                                disabled={followRequestStatus === 'PENDING'} // 요청 중일 경우 버튼 비활성화
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
