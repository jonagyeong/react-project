import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Switch,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Checkbox,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

function SettingPage() {
    const [isPrivate, setIsPrivate] = useState(false);
    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [actualPassword] = useState('1234'); // 실제로는 서버에서 확인해야 함
    const [accountActive, setAccountActive] = useState(true); // 계정 활성화 상태 (기본값은 활성화)
    
    const [blockedUsers, setBlockedUsers] = useState(['user123', 'troublemaker']);
    const [closeFriends, setCloseFriends] = useState([]);
    const [allFriends] = useState(['friend1', 'friend2', 'friend3']);
    const [searchTerm, setSearchTerm] = useState('');

    // 친구 목록 및 상태를 백엔드에서 가져오는 함수
    useEffect(() => {
        const fetchCloseFriends = async () => {
            const response = await fetch("http://localhost:3005/profile/closeFriends");
            const data = await response.json();
            setCloseFriends(data.closeFriends);
        };

        fetchCloseFriends();
    }, []);

    const togglePrivacy = () => {
        setIsPrivate(!isPrivate);
    };

    const toggleAccountStatus = async () => {
        setAccountActive(!accountActive);

        const response = await fetch("http://localhost:3005/profile/updateStatus", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: "currentUserId", // 현재 로그인된 사용자 ID를 사용
                status: accountActive ? "inactive" : "active" // 계정 상태 변경
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("계정 상태가 변경되었습니다.");
        } else {
            alert("계정 상태 변경에 실패했습니다.");
        }
    };

    const handleDeleteAccount = () => {
        if (!reason || !password) {
            alert("탈퇴 사유와 비밀번호를 입력해주세요.");
            return;
        }

        if (password !== actualPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (window.confirm("정말로 회원탈퇴를 진행하시겠습니까?")) {
            // TODO: 실제 회원탈퇴 API 호출
            alert("회원탈퇴가 완료되었습니다.");
        }
    };

    const handleUnblock = (user) => {
        setBlockedUsers(prev => prev.filter(u => u !== user));
    };

    const handleCloseFriendToggle = async (friend) => {
        const isFriend = closeFriends.includes(friend);

        if (isFriend) {
            // 친구 취소
            setCloseFriends(prev => prev.filter(f => f !== friend));
            await fetch("http://localhost:3005/profile/removeCloseFriend", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: "currentUserId", // 현재 로그인된 사용자 ID
                    friendId: friend // 취소할 친구의 ID
                })
            });
        } else {
            // 친구 추가
            setCloseFriends(prev => [...prev, friend]);
            await fetch("http://localhost:3005/profile/addCloseFriend", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: "currentUserId", // 현재 로그인된 사용자 ID
                    friendId: friend // 추가할 친구의 ID
                })
            });
        }
    };

    const filteredFriends = allFriends.filter(friend =>
        friend.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                환경설정
            </Typography>

            {/* 공개/비공개 설정 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">비공개 계정</Typography>
                <Switch checked={isPrivate} onChange={togglePrivacy} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 계정 활성화/비활성화 설정 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">계정 상태</Typography>
                <Switch checked={accountActive} onChange={toggleAccountStatus} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 회원 탈퇴 */}
            <Box mb={4}>
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
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteAccount}
                >
                    회원탈퇴
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 차단 목록 */}
            <Box mb={4}>
                <Typography variant="h6" gutterBottom>차단한 계정</Typography>
                <List>
                    {blockedUsers.map(user => (
                        <ListItem key={user} divider>
                            <ListItemText primary={user} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleUnblock(user)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {blockedUsers.length === 0 && (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            차단한 계정이 없습니다.
                        </Typography>
                    )}
                </List>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 친한 친구 관리 */}
            <Box>
                <Typography variant="h6" gutterBottom>친한 친구 관리</Typography>
                <Box display="flex" alignItems="center" mb={2}>
                    <SearchIcon />
                    <TextField
                        variant="standard"
                        placeholder="친구 검색"
                        fullWidth
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ ml: 1 }}
                    />
                </Box>
                <List>
                    {filteredFriends.map(friend => (
                        <ListItem key={friend} divider>
                            <ListItemText primary={friend} />
                            <Checkbox
                                edge="end"
                                checked={closeFriends.includes(friend)}
                                onChange={() => handleCloseFriendToggle(friend)}
                            />
                        </ListItem>
                    ))}
                    {filteredFriends.length === 0 && (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            검색된 친구가 없습니다.
                        </Typography>
                    )}
                </List>
            </Box>
        </Box>
    );
}

export default SettingPage;
