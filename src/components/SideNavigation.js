import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    IconButton,
    InputBase,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Avatar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import CreateIcon from '@mui/icons-material/Create';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const SideNavigation = ({ handleOpenModal = () => { } }) => {
    const navigate = useNavigate();
    // 토큰 안전 디코딩 처리
    const token = localStorage.getItem("token");
    let my = null;
    if (typeof token === "string" && token.length > 0) {
        try {
            my = jwtDecode(token);
        } catch (e) {
            console.error("Invalid token:", e);
        }
    }

    const [anchorEl, setAnchorEl] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchType, setSearchType] = useState('recent'); // recent, account 만 사용

    const handleMoreClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // const handleToggleMode = () => {
    //     setDarkMode(prev => !prev);
    //     alert(`모드가 ${darkMode ? '라이트' : '다크'} 모드로 전환되었습니다.`);
    //     handleClose();
    // };

    const handleGoToSettings = () => {
        navigate('/settingpage');
        handleClose();
    };

    const handleSearchIconClick = () => {
        setIsSearchActive(true);
        fetchRecentSearches();
    };

    const handleSearchClose = () => {
        setIsSearchActive(false);
        setSearchQuery('');
        setSuggestions([]);
        setSearchType('recent');
    };

    // 최근 검색어 가져오기
    const fetchRecentSearches = () => {
        fetch("http://localhost:3005/search/history/" + my.userId)
            .then(res => res.json())
            .then(data => {
                setSuggestions(data.history || []);
                setSearchType('recent');
            })
            .catch(err => console.error("최근 검색어 불러오기 실패:", err));
    };

    // 자동완성 가져오기 (계정만)
    const fetchSuggestions = (query) => {
        if (!query.startsWith('@')) {
            setSuggestions([]);
            setSearchType('recent');
            return;
        }

        const keyword = query.slice(1);
        setSearchType('account');

        fetch(`http://localhost:3005/search/account?keyword=${encodeURIComponent(keyword)}`)
            .then(res => res.json())
            .then(data => setSuggestions(data.result || []))
            .catch(err => console.error("계정 자동완성 실패:", err));
    };

    // 검색 기록 저장 (계정 검색만)
    const saveSearchHistory = (keyword, type) => {
        if (type !== 'account' || !keyword.startsWith('@')) {
            return;
        }

        fetch(`http://localhost:3005/search/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: my.userId,
                keyword,
                type
            })
        }).catch(err => console.error("검색 기록 저장 실패:", err));
    };

    const handleSuggestionClick = (keyword, type) => {
        saveSearchHistory(keyword, type);
        handleSearchClose();

        if (type === 'account') {
            const userId = keyword.startsWith('@') ? keyword.slice(1) : keyword;
            navigate(`/otherpage?userId=${encodeURIComponent(userId)}`);
        }
    };

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetchSuggestions(searchQuery);
        } else {
            fetchRecentSearches();
        }
    }, [searchQuery]);

    const navItems = [
        { icon: <HomeIcon />, label: "홈", onClick: () => navigate('/main') },
        { icon: <SearchIcon />, label: "검색", onClick: handleSearchIconClick },
        { icon: <NotificationsIcon />, label: "알림", onClick: null },
        { icon: <MessageIcon />, label: "메세지", onClick: () => navigate('/dmpage') },
        { icon: <CreateIcon />, label: "글쓰기", onClick: () => handleOpenModal() },
        { icon: <AccountCircleIcon />, label: "프로필", onClick: () => navigate('/mypage') },
        { icon: <MoreHorizIcon />, label: "더보기", onClick: handleMoreClick },
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

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    {/* <MenuItem onClick={handleToggleMode}>
                        {darkMode ? '☀️ 라이트 모드로 전환' : '🌙 다크 모드로 전환'}
                    </MenuItem> */}
                    <MenuItem onClick={handleGoToSettings}>⚙️ 환경설정</MenuItem>
                </Menu>
            </Box>

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

            {isSearchActive && suggestions.length > 0 && (
                <Paper
                    sx={{
                        position: "fixed",
                        top: 64,
                        left: "60px",
                        width: "calc(100% - 60px)",
                        maxWidth: 400,
                        zIndex: 1400,
                        maxHeight: 300,
                        overflowY: 'auto',
                    }}
                >
                    <List>
                        {searchType === 'recent' && (
                            <Typography variant="caption" pl={2} pt={1}>최근 검색어</Typography>
                        )}

                        {suggestions.map((item, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onClick={() => handleSuggestionClick(item.keyword || item.KEYWORD, 'account')}>

                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            src={item.profileImg || "/default-profile.png"}
                                            sx={{ width: 32, height: 32, mr: 1 }}
                                        />
                                        <Box>
                                            <Typography variant="body2">{item.keyword || item.KEYWORD}</Typography>
                                        </Box>
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}


        </>
    );
};

export default SideNavigation;
