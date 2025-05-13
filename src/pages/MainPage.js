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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import FriendRecommendations from "../components/FriendRecommendations";
import FeedModal from '../components/FeedModal';
import SideNavigation from "../components/SideNavigation";
import FeedDetailModal from "../components/FeedDetailModal";
import { getTimeAgo } from '../components/TimeAgo'; // 경로는 프로젝트 구조에 맞게 수정



function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [feeds, setFeeds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [menuFeedId, setMenuFeedId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // ✅ anchorEl 상태 추가
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingFeed, setEditingFeed] = useState(null);
    const [viewType, setViewType] = useState("ALL"); // "ALL" 또는 "FRIEND" 선택


    const navigate = useNavigate();

    const handleMenuOpen = (feed, event) => {

        setMenuFeedId(feed.FEEDNO);
        setMenuOpen(true); // 팝업 열기
        setAnchorEl(event.currentTarget);// ✅ 클릭된 요소를 anchor로 지정
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuOpen(false); // 팝업 닫기
        setMenuFeedId(null);
    };

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
                const filteredFeeds = data.list.filter(feed =>
                    (feed.VISIBLE_SCOPE === "ALL" || feed.VISIBLE_SCOPE === "FRIEND") && feed.USERID !== user.userId
                );
                setFeeds(filteredFeeds);
            });
    };

    useEffect(() => {
        fnFeedList();
    }, [viewType]); // viewType이 변경될 때마다 피드 목록을 다시 가져옵니다.


    const handleLogout = () => {
        localStorage.removeItem("token");
        setSnackOpen(true);
        setDialogOpen(false);
        setTimeout(() => {
            navigate("/");
        }, 1500);
    };

    const handleFeedClick = (feed) => {
        setSelectedFeed(feed);
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
                handleMenuClose();
                fnFeedList();
            })
    };

    // 전체 공개/친구 공개 버튼 클릭 시
    const handleViewChange = (type) => {
        setViewType(type);
    };

    return (
        <Box display="flex">

            <SideNavigation handleOpenModal={handleOpenModal} />
            <Box
                flex={1}
                p={3}
                sx={{
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}>
                <Box sx={{ width: "100%", maxWidth: 450 }}>
                    {/* 공개 범위 버튼 */}
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Button variant={viewType === "ALL" ? "contained" : "outlined"} onClick={() => handleViewChange("ALL")}>
                            전체 공개
                        </Button>
                        <Button variant={viewType === "FRIEND" ? "contained" : "outlined"} onClick={() => handleViewChange("FRIEND")}>
                            친구 공개
                        </Button>
                    </Box>
                    {feeds.length === 0 ? (
                        <Typography variant="body2">피드를 불러오는 중입니다...</Typography>
                    ) : (
                        feeds.map((feed, index) => (
                            <Card
                                key={index}
                                sx={{ marginBottom: 4 }}
                                elevation={0}
                                onClick={() => handleFeedClick(feed)}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                                            {feed.USERID ? feed.USERID.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                    }
                                    action={
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleMenuOpen(feed, e); }}>
                                            <Typography fontSize="24px">⋯</Typography>
                                        </IconButton>
                                    }
                                    title={
                                        <Typography variant="subtitle1">
                                            @{feed.USERID} <span style={{ color: '#999' }}>· {getTimeAgo(feed.REGDATE)}</span>
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
                                        {feed.CONTENT}
                                    </Typography>
                                    {feed.hashtag && feed.hashtag.length > 0 && (
                                        <Box sx={{ marginBottom: 1 }}>
                                            {feed.hashtag.map((tag, idx) => (
                                                <Typography
                                                    key={idx}
                                                    variant="body2"
                                                    component="span"
                                                    sx={{ color: '#1976d2', marginRight: 1, cursor: 'pointer' }}

                                                >
                                                    #{tag}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    <Box display="flex" alignItems="center">
                                        <IconButton>
                                            <FavoriteIcon color="error" />
                                        </IconButton>
                                        <Typography variant="body2" sx={{ marginLeft: 1 }}>
                                            {feed.likesCount || 0} Likes
                                        </Typography>
                                        <IconButton sx={{ marginLeft: 'auto' }}>
                                            <ShareIcon />
                                        </IconButton>
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
                        <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)} style={{ color: "#5C87C3", border: "1px solid #5C87C3" }}>로그아웃</Button>
                    </Box>
                    <Box>
                        <FriendRecommendations user={user} />
                    </Box>
                </Box>
            )}

            <FeedModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditMode(false);
                    setEditingFeed(null);
                }}
                fnFeedList={fnFeedList}
                editMode={editMode}
                editingFeed={editingFeed}
            />
            <Dialog open={dialogOpen}>
                <DialogTitle>로그아웃 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>정말 로그아웃하시겠습니까?</DialogContentText>
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

            {selectedFeed && (
                <FeedDetailModal
                    open={Boolean(selectedFeed)}
                    onClose={() => setSelectedFeed(null)}
                    selectedFeed={selectedFeed}
                />
            )}

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
                    {user && feeds.find(f => f.FEEDNO === menuFeedId)?.USERID === user.userId ? (
                        <>
                            <Button fullWidth onClick={() => {
                                const feedToEdit = feeds.find(f => f.FEEDNO === menuFeedId);
                                const convertedFeed = {
                                    id: feedToEdit.FEEDNO,
                                    content: feedToEdit.CONTENT,
                                    location: feedToEdit.LOCATION,
                                    visible_scope: feedToEdit.VISIBLE_SCOPE,
                                    thumbnail: feedToEdit.IMGPATH + feedToEdit.IMGNAME
                                };
                                console.log("convertedFeed ==> ", convertedFeed)
                                setEditingFeed(convertedFeed);
                                setEditMode(true);
                                setModalOpen(true); // 기존 FeedModal 재사용
                                handleMenuClose();
                            }}>수정</Button>

                            <Button fullWidth onClick={() => {
                                handleDeleteFeed(menuFeedId);
                            }} style={{ color: "red" }}>삭제</Button>
                        </>
                    ) : (
                        <>
                            <Button fullWidth onClick={() => {
                                console.log("신고 클릭");
                                handleMenuClose();
                            }} style={{ color: "red" }}>신고</Button>
                            <Button fullWidth onClick={() => {
                                console.log("팔로우/팔로우 해제 클릭");
                                handleMenuClose();
                            }}>팔로우/팔로우 해제</Button>
                            <Button fullWidth onClick={() => {
                                console.log("차단 클릭");
                                handleMenuClose();
                            }} style={{ color: "red" }}>차단</Button>
                        </>
                    )}
                    <Button fullWidth onClick={handleMenuClose} style={{ marginTop: '8px', color: 'gray' }}>
                        취소
                    </Button>
                </DialogContent>
            </Dialog>




        </Box>
    );
}

export default MainPage;
