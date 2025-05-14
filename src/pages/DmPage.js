import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Box, Typography, Divider } from '@mui/material';

import SideNavigation from '../components/SideNavigation';
import FeedModal from '../components/FeedModal';

function DmPage() {
    const [rooms, setRooms] = useState([]); // 내가 속한 대화방 목록
    const [selectedRoomId, setSelectedRoomId] = useState(null); // 선택한 방
    const [messages, setMessages] = useState([]); // 해당 방의 메시지 목록
    const [modalOpen, setModalOpen] = useState(false);

    const token = localStorage.getItem("token");

    const user = useMemo(() => {
        if (!token) return null;
        try {
            return jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
            return null;
        }
    }, [token]);

    useEffect(() => {
        if (user?.userId) {
            fetchMyRooms();
        }
    }, [user]);

    const fetchMyRooms = () => {
        fetch("http://localhost:3005/dm/rooms/" + user.userId)
            .then(res => res.json())
            .then(data => {
                console.log("받은 방 목록:", data.rooms);
                setRooms(data.rooms);
            });
    };

    const fetchMessages = (roomId) => {
        fetch("http://localhost:3005/dm/message/" + roomId)
            .then(res => res.json())
            .then(data => {
                console.log("받은 메시지 목록:", data.DMmessage);
                setMessages(data.DMmessage);
                setSelectedRoomId(roomId);
            });
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <SideNavigation handleOpenModal={handleOpenModal} />

            {/* 좌측: 대화방 목록 */}
            <Box sx={{
                width: '25%',
                borderRight: '1px solid #ccc',
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <Typography variant="h6">대화방 목록</Typography>
                {rooms.map(room => (
                    <Box
                        key={room.ROOM_ID}
                        onClick={() => fetchMessages(room.ROOM_ID)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            cursor: 'pointer',
                            backgroundColor: selectedRoomId === room.ROOM_ID ? '#f0f0f0' : 'white',
                            fontWeight: selectedRoomId === room.ROOM_ID ? 'bold' : 'normal',
                            borderBottom: '1px solid #eee',
                            transition: 'background-color 0.3s ease-in-out',
                            '&:hover': { backgroundColor: '#f7f7f7' }
                        }}
                    >
                        <Box>
                            {/* 대화방 ID 표시 */}
                            <Typography variant="body2">대화방 #{room.ROOM_ID}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* 중앙: 메시지 뷰 */}
            <Box sx={{ width: '50%', padding: '20px', overflowY: 'auto' }}>
                <Typography variant="h6">대화방 목록</Typography>
                {rooms.map(room => (
                    <Box
                        key={room.ROOM_ID}
                        onClick={() => fetchMessages(room.ROOM_ID)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            cursor: 'pointer',
                            backgroundColor: selectedRoomId === room.ROOM_ID ? '#f0f0f0' : 'white',
                            fontWeight: selectedRoomId === room.ROOM_ID ? 'bold' : 'normal',
                            borderBottom: '1px solid #eee',
                            transition: 'background-color 0.3s ease-in-out',
                            '&:hover': { backgroundColor: '#f7f7f7' }
                        }}
                    >
                        <Box>
                            {/* 대화방 ID 표시 */}
                            <Typography variant="body2">대화방 #{room.ROOM_ID}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* 우측: 채팅 정보 */}
            <Box sx={{
                width: '25%',
                borderLeft: '1px solid #ccc',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                {selectedRoomId ? (
                    <>
                        <Typography variant="h6">대화방 정보</Typography>
                        <Divider sx={{ marginY: '10px' }} />
                        <Typography variant="body2">대화방 ID: {selectedRoomId}</Typography>
                        <Typography variant="body2">참여자: {rooms.find(room => room.ROOM_ID === selectedRoomId)?.members.join(', ')}</Typography>
                    </>
                ) : (
                    <Typography>채팅방 정보를 확인하려면 대화방을 선택하세요.</Typography>
                )}
            </Box>

            <FeedModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </Box>
    );
}

export default DmPage;
