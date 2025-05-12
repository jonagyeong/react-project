import React from 'react';
import { Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import CreateIcon from '@mui/icons-material/Create';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';

const SideNavigation = ({ handleOpenModal }) => {
    const navigate = useNavigate();

    const navItems = [
        { icon: <HomeIcon />, label: "홈", onClick: () => navigate('/main') },
        { icon: <SearchIcon />, label: "검색", onClick: () => navigate('/search') },
        { icon: <NotificationsIcon />, label: "알림", onClick: null },
        { icon: <MessageIcon />, label: "메세지", onClick: null },
        { icon: <CreateIcon />, label: "글쓰기", onClick: () => handleOpenModal()
 }, // MainPage에서 넘긴 모달 열기 함수 사용
        { icon: <AccountCircleIcon />, label: "프로필", onClick: () => navigate('/mypage') },
        { icon: <MoreHorizIcon />, label: "더보기", onClick: null },
    ];

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "200px",
                backgroundColor: "#f5f5f5",
                height: "100vh",
                padding: "16px 8px",
                boxSizing: "border-box",
                zIndex: 1300,
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
    );
};

export default SideNavigation;
