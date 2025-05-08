import React, { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateIcon from '@mui/icons-material/Create';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);

    const handleSearchClick = () => {
        setSearchOpen(!searchOpen);
    };

    const navItems = [
        { icon: <HomeIcon />, label: "홈", onClick: null },
        { icon: <SearchIcon />, label: "검색", onClick: handleSearchClick },
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
                        onClick={item.onClick || (() => {})}
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
        </Box>
    );
}

export default MainPage;
