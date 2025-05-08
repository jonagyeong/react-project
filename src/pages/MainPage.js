import React, { useState } from "react";
import {
    Box, Typography, TextField, Button, Avatar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateIcon from '@mui/icons-material/Create';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false); // Snackbar 상태
    const navigate = useNavigate();

    let user = null;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        setSnackOpen(true); // 로그아웃 후 Snackbar 열기
        setDialogOpen(false); // 다이얼로그 닫기
        setTimeout(() => {
            navigate("/"); // 1.5초 후 이동
        }, 1500);
    };

    const navItems = [
        { icon: <HomeIcon />, label: "홈", onClick: null },
        { icon: <SearchIcon />, label: "검색", onClick: () => setSearchOpen(!searchOpen) },
        { icon: <NotificationsIcon />, label: "알림", onClick: null },
        { icon: <MessageIcon />, label: "메세지", onClick: null },
        { icon: <CreateIcon />, label: "글쓰기", onClick: null },
        { icon: <AccountCircleIcon />, label: "프로필", onClick: null },
        { icon: <MoreHorizIcon />, label: "더보기", onClick: null },
    ];

    return (
        <Box display="flex">
            {/* 사이드 네비게이션 */}
            <Box
                sx={{
                    width: "200px",
                    backgroundColor: "#f5f5f5",
                    height: "100vh",
                    padding: "16px 8px",
                    boxSizing: "border-box"
                }}
            >
                {navItems.map((item, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        mb={2}
                        sx={{ cursor: "pointer" }}
                        onClick={item.onClick || (() => { })}
                    >
                        {item.icon}
                        <Typography variant="body1" ml={2}>
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* 메인 콘텐츠 영역 */}
            <Box flex={1} p={3}>

                {/* 오른쪽 상단 로그인 정보 */}
                {user && (
                    <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
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
                )}

                <Typography variant="h5">메인 피드 영역입니다</Typography>

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
