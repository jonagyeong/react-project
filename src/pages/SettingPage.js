import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Switch,
    Checkbox,
    FormControlLabel,
    Avatar,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

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

    // 프로필 정보 상태
    const [profile, setProfile] = useState({
        userId: '',
        address: '',
        phone: '',
        birth: '',
        intro: '',
        profileImg: '',
        name: '',
    });
    const [profileImgFile, setProfileImgFile] = useState(null);
    const [profileImgPreview, setProfileImgPreview] = useState('');

    let user = null;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
        }
    }

    // 프로필 정보 불러오기
    const fetchProfile = () => {
        fetch("http://localhost:3005/profile/info/" + user.userId)
            .then(res => res.json())
            .then(data => {
                console.log(data.profile)
                setProfile({
                    userId: data.profile.USERID || '',
                    address: data.profile.ADDRESS || '',
                    phone: data.profile.PHONE || '',
                    birth: data.profile.BIRTH || '',
                    intro: data.profile.INTRO || '',
                    profileImg: data.profile.PROFILEIMG || '',
                    name: data.profile.USERNAME || '', // 이름 필드가 별도일 경우 맞춰서 사용하세요
                });
                setProfileImgPreview(data.PROFILEIMG || '');
            })
            .catch(err => console.error("프로필 정보 불러오기 실패", err));
    };

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
    };

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
    };

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
            fetchProfile();
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
            // 여기서 API 호출 필요하면 추가하세요
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    // 프로필 입력 변경 핸들러
    const handleInputChange = (field) => (e) => {
        setProfile(prev => ({ ...prev, [field]: e.target.value }));
    };

    // 프로필 이미지 업로드 핸들러
    const handleProfileImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImgFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImgPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 프로필 저장 함수
    const handleSaveProfile = async () => {
        try {
            let profileImgUrl = profile.profileImg;

            // 이미지 파일이 새로 선택된 경우에만 업로드
            if (profileImgFile) {
                // 이미지 업로드 API 호출 예시 (실제 API 주소 및 방식에 맞게 수정 필요)
                const formData = new FormData();
                formData.append("profileImg", profileImgFile);
                formData.append("userId", user.userId);

                const uploadRes = await fetch("http://localhost:3005/profile/upload-img", {
                    method: "POST",
                    body: formData,
                });

                const uploadData = await uploadRes.json();
                if (uploadData.success && uploadData.url) {
                    profileImgUrl = uploadData.url;
                } else {
                    alert("프로필 이미지 업로드 실패");
                    return;
                }
            }

            // 프로필 정보 PUT 요청
            const res = await fetch("http://localhost:3005/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.userId,
                    address: profile.address,
                    phone: profile.phone,
                    birth: profile.birth,
                    intro: profile.intro,
                    profileImg: profileImgUrl,
                    name: profile.name,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert("프로필이 성공적으로 저장되었습니다.");
                setProfileImgFile(null);
                setProfileImgPreview(profileImgUrl);
            } else {
                alert("프로필 저장에 실패했습니다.");
            }
        } catch (err) {
            console.error("프로필 저장 실패", err);
            alert("프로필 저장 중 오류가 발생했습니다.");
        }
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

                        <Box display="flex" alignItems="center" mb={3}>
                            {profile.userId}
                            <Avatar
                                src={profileImgPreview}
                                alt="프로필 이미지"
                                sx={{ width: 100, height: 100, mr: 2 }}
                            />
                            <label htmlFor="profile-img-upload">
                                <input
                                    accept="image/*"
                                    id="profile-img-upload"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleProfileImgChange}
                                />
                                <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
                                    사진 변경
                                </Button>
                            </label>
                        </Box>

                        <TextField
                            label="이름"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={profile.name}
                            onChange={handleInputChange('name')}
                        />
                        <TextField
                            label="주소"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={profile.address}
                            onChange={handleInputChange('address')}
                        />
                        <TextField
                            label="전화번호"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={profile.phone}
                            onChange={handleInputChange('phone')}
                        />
                        <TextField
                            label="생년월일"
                            type="date"
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={profile.birth}
                            onChange={handleInputChange('birth')}
                        />
                        <TextField
                            label="소개글"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                            value={profile.intro}
                            onChange={handleInputChange('intro')}
                        />

                        <Button variant="contained" onClick={handleSaveProfile}>저장</Button>
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
