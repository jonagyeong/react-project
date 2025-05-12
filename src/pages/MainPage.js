import React, { useState, useEffect } from "react";
import {
    Box, Typography, TextField, Button, Avatar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Card, CardHeader, CardMedia, CardContent,
    IconButton
} from "@mui/material";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';


import FriendRecommendations from "../components/FriendRecommendations"; // 경로 맞게 수정
import FeedModal from '../components/FeedModal'
import SideNavigation from "../components/SideNavigation";


function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false); // Snackbar 상태
    const [feeds, setFeeds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);


    const navigate = useNavigate();

    const handleOpenModal = () => {
        setModalOpen(true);
    };


    // 토큰 가져오기
    let user = null;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
        }
    }

    // 리스트 가져오기
    const fnFeedList = () => {
        fetch("http://localhost:3005/feed/list")
            .then(res => res.json())
            .then(data => {
                setFeeds(data.list)
                console.log(data.list)
            }
            )

    }
    useEffect(() => {
        console.log(feeds)
        fnFeedList();
    }, []);

    // 작성 시간 변환 함수
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diff = Math.floor((now - past) / 1000); // 초 단위 차이

        if (diff < 60) return `${diff}초 전`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        setSnackOpen(true); // 로그아웃 후 Snackbar 열기
        setDialogOpen(false); // 다이얼로그 닫기
        setTimeout(() => {
            navigate("/"); // 1.5초 후 이동
        }, 1500);
    };

    return (
        <Box display="flex">

            <SideNavigation />

            {/* 메인 콘텐츠 영역 */}
            <Box
                flex={1}
                p={3}
                sx={{
                    marginLeft: "200px",       // 고정된 네비게이션 바 너비만큼 왼쪽 여백을 둠
                    overflow: "auto",          // 콘텐츠가 네비게이션과 겹치지 않도록
                    display: "flex",
                    justifyContent: "center",  // 피드를 중앙에 배치
                }}
            >
                {/* 피드 출력 영역 */}
                <Box sx={{ width: "100%", maxWidth: 400 }}> {/* 최대 너비 설정 */}
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
                        <TextField
                            variant="outlined"
                            label="검색"
                            fullWidth
                        />
                    </Box>
                )}
            </Box>


            {/* 로그인 정보와 추천 친구를 오른쪽에 배치 */}
            {user && (
                <Box
                    sx={{
                        position: "absolute",   // 화면에 고정
                        top: "10px",            // 상단에서 조금 내려서 배치
                        right: "10px",          // 오른쪽 끝에 배치
                        display: "flex",
                        flexDirection: "column", // 세로로 배치
                        alignItems: "flex-end",   // 오른쪽 정렬
                        zIndex: 1301            // 다른 콘텐츠보다 위에 표시
                    }}
                >
                    {/* 로그인 정보 */}
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

                    {/* 추천 친구 */}
                    <Box>
                        <FriendRecommendations user={user} />
                    </Box>
                </Box>
            )}

            <FeedModal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Typography>이곳에 피드 상세 내용 또는 이미지 슬라이더 넣기</Typography>
            </FeedModal>

            {/* ✅ 확인 다이얼로그 */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
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

            {/* ✅ 로그아웃 후 Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={2000} // 2초로 설정
                onClose={() => setSnackOpen(false)}
                message="로그아웃 되었습니다."
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // 위치 조정
                sx={{ zIndex: 1301 }} // z-index를 높게 설정하여 다른 UI 요소들 위로 띄우기
            />
        </Box>



    );
}

export default MainPage;
