import React, { useState } from 'react';
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    IconButton,
    InputBase,
    Paper
} from '@mui/material';
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
    const [anchorEl, setAnchorEl] = useState(null);
    const [darkMode, setDarkMode] = useState(false); // 모드 상태
    const [isSearchActive, setIsSearchActive] = useState(false); // 검색 활성화 상태
    const [searchQuery, setSearchQuery] = useState('');

    const handleMoreClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggleMode = () => {
        setDarkMode((prev) => !prev);
        alert(`모드가 ${darkMode ? '라이트' : '다크'} 모드로 전환되었습니다.`);
        handleClose();
    };

    const handleGoToSettings = () => {
        navigate('/settingpage');
        handleClose();
    };

    const handleSearchIconClick = () => {
        setIsSearchActive(true);
    };

    const handleSearchClose = () => {
        setIsSearchActive(false);
        setSearchQuery('');
    };

    const navItems = [
        { icon: <HomeIcon />, label: "홈", onClick: () => navigate('/main') },
        { icon: <SearchIcon />, label: "검색", onClick: handleSearchIconClick },
        { icon: <NotificationsIcon />, label: "알림", onClick: null },
        { icon: <MessageIcon />, label: "메세지", onClick: () => navigate('/dmpage') },
        { icon: <CreateIcon />, label: "글쓰기", onClick: () => handleOpenModal() },
        { icon: <AccountCircleIcon />, label: "프로필", onClick: () => navigate('/mypage') },
        {
            icon: <MoreHorizIcon />,
            label: "더보기",
            onClick: handleMoreClick
        },
    ];

    return (
        <>
            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    padding: "16px 8px",
                    boxSizing: "border-box",
                    zIndex: 1300,
                    backgroundColor: "#f5f5f5",
                    width: isSearchActive ? "60px" : "200px",
                    transition: "width 0.3s ease",
                    overflowX: "hidden",
                }}
            >
                {navItems.map((item, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        mb={2}
                        sx={{
                            cursor: "pointer",
                            justifyContent: isSearchActive ? "center" : "flex-start",
                        }}
                        onClick={item.onClick || (() => { })}
                    >
                        {item.icon}
                        {!isSearchActive && (
                            <Typography variant="body1" ml={2}>
                                {item.label}
                            </Typography>
                        )}
                    </Box>
                ))}

                {/* 더보기 메뉴 */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={handleToggleMode}>
                        {darkMode ? '☀️ 라이트 모드로 전환' : '🌙 다크 모드로 전환'}
                    </MenuItem>
                    <MenuItem onClick={handleGoToSettings}>⚙️ 환경설정</MenuItem>
                </Menu>
            </Box>

            {/* 검색창 박스: 네비게이션 바로 오른쪽 */}
            {isSearchActive && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 16,
                        left: "60px",
                        width: "calc(100% - 60px)",
                        maxWidth: 400,
                        padding: "4px 8px",
                        backgroundColor: "#fff",
                        boxShadow: '0 2px 8px rgb(0 0 0 / 0.15)',
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        zIndex: 1400,
                    }}
                >
                    <InputBase
                        placeholder="검색어를 입력하세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, ml: 1 }}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                handleSearchClose();
                            }
                        }}
                    />
                    <IconButton onClick={handleSearchClose} size="small" sx={{ ml: 1 }}>
                        ✕
                    </IconButton>
                </Box>
            )}
        </>
    );
};

export default SideNavigation;
