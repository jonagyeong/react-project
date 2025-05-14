import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Switch,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';

import SideNavigation from '../components/SideNavigation';
import FeedModal from '../components/FeedModal';

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#1e88e5',
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: '#f5f5f5',
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

function SettingPage() {
    const [isPrivate, setIsPrivate] = useState(false);
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [mutuals, setMutuals] = useState([]);
    const [closeFriends, setCloseFriends] = useState(new Set());

    const [selectedSetting, setSelectedSetting] = useState('');
    const [modalOpen, setModalOpen] = useState(false);


    let user = null;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
        }
    }

    const fnUserYn = () => {
        fetch("http://localhost:3005/profile/yn/" + user.userId)
            .then(res => res.json())
            .then(data => {
                if (data.yn === "Y") {
                    setIsPrivate(true);
                } else {
                    setIsPrivate(false);
                }
            });
    }

    const fetchMutuals = async () => {
        try {
            const res = await fetch("http://localhost:3005/follow/mutual/" + user.userId);
            const data = await res.json();
            setMutuals(data.mutual);
        } catch (err) {
            console.error("맞팔 목록 가져오기 실패", err);
        }
    };

    const fetchCloseFriends = async () => {
        try {
            const res = await fetch("http://localhost:3005/close-friend/" + user.userId);
            const data = await res.json();
            setCloseFriends(new Set(data.list));
        } catch (err) {
            console.error("친한 친구 목록 가져오기 실패", err);
        }
    }

    const toggleCloseFriend = async (friendId) => {
        const updated = new Set(closeFriends);
        const isClose = updated.has(friendId);

        try {
            const url = isClose
                ? "http://localhost:3005/close-friend/remove"
                : "http://localhost:3005/close-friend";
            const method = "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId: user.userId, friendUserId: friendId })
            });

            const result = await res.json();
            if (result.success) {
                if (isClose) {
                    updated.delete(friendId);
                } else {
                    updated.add(friendId);
                }
                setCloseFriends(updated);
            } else {
                alert("친한 친구 업데이트 실패: " + result.message);
            }
        } catch (err) {
            console.error("친한 친구 토글 실패", err);
        }
    };


    useEffect(() => {
        if (user && user.userId) {
            fnUserYn();
            fetchMutuals();
            fetchCloseFriends();
        }
    }, []);

    useEffect(() => {
        console.log("맞팔 목록:", mutuals);
        console.log("친한 친구 목록(Set):", closeFriends);
    }, [mutuals, closeFriends]);

    const handleSettingChange = (setting) => {
        setSelectedSetting(setting);
    };

    const togglePrivacy = () => {
        const newPrivacy = !isPrivate;
        setIsPrivate(newPrivacy);

        fetch("http://localhost:3005/profile/privacy", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.userId,
                isPrivate: newPrivacy
            })
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    alert("업데이트에 실패했습니다.");
                }
            })
            .catch(err => {
                console.error("Error updating privacy:", err);
            });
    };

    const handleDeleteAccount = () => {
        if (!reason || !password) {
            alert("탈퇴 사유와 비밀번호를 입력해주세요.");
            return;
        }

        if (window.confirm("정말로 회원탈퇴를 진행하시겠습니까?")) {
            alert("회원탈퇴가 완료되었습니다.");
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const navItems = [
        { label: "프로필 편집", setting: "editProfile" },
        { label: "계정공개범위", setting: "privacy" },
        { label: "친한친구", setting: "closeFriends" },
        { label: "차단된 계정", setting: "blockedAccounts" },
        { label: "회원탈퇴", setting: "deleteAccount" },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ width: 250 }}>
                <SideNavigation handleOpenModal={handleOpenModal} />
            </Box>

            <Box sx={{ width: "200px", backgroundColor: "white", height: "100vh", padding: "16px 8px" }}>
                <Typography variant="body1" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }} ml={2}>
                    설정
                </Typography>
                {navItems.map((item, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        mb={2}
                        sx={{ cursor: "pointer", fontWeight: selectedSetting === item.setting ? 'bold' : 'normal' }}
                        onClick={() => handleSettingChange(item.setting)}
                    >
                        <Typography variant="body1" ml={2}>
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1, padding: "16px" }}>
                {selectedSetting === "editProfile" && (
                    <>
                        <Typography variant="h6" gutterBottom>프로필 편집</Typography>
                        <TextField label="이름" fullWidth sx={{ mb: 2 }} />
                        <TextField label="소개글" fullWidth sx={{ mb: 2 }} multiline />
                        <Button variant="contained">저장</Button>
                    </>
                )}

                {selectedSetting === "privacy" && (
                    <>
                        <Typography variant="h6" gutterBottom>계정 공개 범위</Typography>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" mr={2}>비공개 계정</Typography>
                            <IOSSwitch checked={isPrivate} onChange={togglePrivacy} />
                        </Box>
                    </>
                )}

                {selectedSetting === "closeFriends" && (
                    <>
                        <Typography variant="h6" gutterBottom>친한 친구</Typography>
                        {mutuals.length === 0 ? (
                            <Typography variant="body2">맞팔 중인 친구가 없습니다.</Typography>
                        ) : (
                            mutuals.map((friendId, idx) => (
                                <Box key={idx} display="flex" alignItems="center" mb={1}>
                                    <Typography sx={{ flex: 1 }}>{friendId}</Typography>
                                    <Checkbox
                                        checked={closeFriends.has(friendId)}
                                        onChange={() => toggleCloseFriend(friendId)}
                                        icon={<span style={{ borderRadius: '50%', border: '1px solid gray', width: 24, height: 24, display: 'inline-block' }} />}
                                        checkedIcon={<span style={{ borderRadius: '50%', backgroundColor: '#4caf50', width: 24, height: 24, display: 'inline-block', color: 'white', textAlign: 'center', lineHeight: '24px' }}>✓</span>}
                                    />
                                </Box>
                            ))
                        )}
                    </>
                )}

                {selectedSetting === "blockedAccounts" && (
                    <>
                        <Typography variant="h6" gutterBottom>차단된 계정</Typography>
                        <Typography variant="body2">차단된 계정 목록이 여기에 표시됩니다.</Typography>
                    </>
                )}

                {selectedSetting === "deleteAccount" && (
                    <>
                        <Typography variant="h6" gutterBottom>회원 탈퇴</Typography>
                        <TextField
                            label="탈퇴 사유"
                            fullWidth
                            multiline
                            rows={2}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="비밀번호 확인"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button variant="outlined" color="error" onClick={handleDeleteAccount}>
                            회원탈퇴
                        </Button>
                    </>
                )}
            </Box>
            <FeedModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                }}
            />
        </Box>
    );
}

export default SettingPage;