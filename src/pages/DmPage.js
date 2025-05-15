import React, { useState, useEffect, useRef, useMemo } from 'react';
import jwtDecode from 'jwt-decode'; // 수정: jwtDecode import 방식
import {
    Box, Typography, TextField, IconButton, Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { io } from 'socket.io-client';

import SideNavigation from '../components/SideNavigation';
import FeedModal from '../components/FeedModal';

function DmPage() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
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

    const socketRef = useRef(null);

    useEffect(() => {
        if (!user?.userId) return;

        // 소켓 연결
        socketRef.current = io("http://localhost:3005", {
            transports: ['websocket'],
        });

        socketRef.current.emit('join', user.userId);

        // 새 메시지 수신 처리
        socketRef.current.on('newMessage', (data) => {
            if (data.roomId === selectedRoomId) {
                setMessages(prev => [...prev, data]);
                // 읽음 처리 emit (내가 현재 보고있는 방이라면)
                socketRef.current.emit('readMessage', { roomId: data.roomId, userId: user.userId });
            } else {
                fetchMyRooms();
            }
        });

        // 읽음 상태 업데이트 이벤트 수신
        socketRef.current.on('readMessage', ({ roomId, userId: readerId }) => {
            if (roomId === selectedRoomId && readerId !== user.userId) {
                // 상대방이 메시지를 읽음 처리 했을 때, 해당 메시지들 읽음 상태 갱신
                setMessages(prevMsgs =>
                    prevMsgs.map(msg =>
                        msg.FROM_USERID === user.userId ? { ...msg, READFLG: 'Y' } : msg
                    )
                );
                fetchMyRooms();
            }
        });

        return () => {
            socketRef.current.disconnect();
            socketRef.current = null;
        };
    }, [user, selectedRoomId]);

    useEffect(() => {
        if (user?.userId) {
            fetchMyRooms();
        }
    }, [user]);

    const fetchMyRooms = () => {
        fetch(`http://localhost:3005/dm/rooms/${user.userId}`)
            .then(res => res.json())
            .then(data => {
                setRooms(data.rooms);
            })
            .catch(err => console.error('방 조회 실패:', err));
    };

    const fetchMessages = async (roomId) => {
        if (!user?.userId) return;

        // 읽음 처리 API 호출
        await fetch(`http://localhost:3005/dm/read/${roomId}`, {
            method: 'POST',
            body: JSON.stringify({ userId: user.userId }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(console.error);

        // 읽음 처리 소켓 이벤트 emit
        socketRef.current?.emit('readMessage', { roomId, userId: user.userId });

        // 메시지 목록 조회
        fetch(`http://localhost:3005/dm/message/${roomId}`)
            .then(res => res.json())
            .then(data => {
                setMessages(data.DMmessage || []);
                setSelectedRoomId(roomId);
                fetchMyRooms();
            })
            .catch(err => console.error('메시지 조회 실패:', err));
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedRoomId || !user?.userId) return;

        const messageToSend = newMessage.trim();
        const room = rooms.find(r => r.ROOM_ID === selectedRoomId);
        if (!room) return;

        const toUserId = room.USERID;

        // 소켓 메시지 전송
        socketRef.current?.emit('sendMessage', {
            roomId: selectedRoomId,
            fromUserId: user.userId,
            toUserId,
            message: messageToSend,
        });

        // DB 저장 요청
        fetch("http://localhost:3005/dm/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomId: selectedRoomId,
                fromUserId: user.userId,
                toUserId,
                message: messageToSend
            })
        })
            .then(res => res.json())
            .then(data => {
                const newMsg = {
                    DM_ID: data.DMmessage.DM_ID,
                    FROM_USERID: user.userId,
                    TO_USERID: toUserId,
                    MESSAGE: messageToSend,
                    READFLG: 'N',
                    REGDATE: data.DMmessage.REGDATE
                };

                setMessages(prev => [...prev, newMsg]);
                setNewMessage('');
            })
            .catch(err => {
                console.error('메시지 전송 실패:', err);
            });
    };

    const selectedRoom = rooms.find(r => r.ROOM_ID === selectedRoomId);
    const otherUser = selectedRoom ? {
        userId: selectedRoom.USERID,
        username: selectedRoom.USERNAME,
        profileImg: selectedRoom.PROFILIMG,
    } : null;

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <SideNavigation handleOpenModal={() => setModalOpen(true)} />

            <Box sx={{
                width: '320px',
                borderRight: '1px solid #ccc',
                overflowY: 'auto',
                marginLeft: 25,
                p: 2,
            }}>
                <Typography variant="h6" gutterBottom>메시지</Typography>
                {rooms.map(room => (
                    <Box
                        key={room.ROOM_ID}
                        onClick={() => fetchMessages(room.ROOM_ID)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: selectedRoomId === room.ROOM_ID ? '#f0f0f0' : 'transparent',
                            '&:hover': { backgroundColor: '#f7f7f7' }
                        }}
                    >
                        <Avatar src={room.PROFILIMG} alt={room.USERNAME} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" noWrap>{room.USERNAME}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.875rem' }}>
                                {room.LAST_MESSAGE || '새 대화 시작하기'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                            {formatTime(room.LAST_MESSAGE_TIME)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
            }}>
                {selectedRoomId && otherUser ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
                            <Avatar src={otherUser.profileImg} alt={otherUser.username} sx={{ mr: 2 }} />
                            <Typography variant="h6">{otherUser.username}</Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                            {messages.map((msg, index) => {
                                const isMyMessage = msg.FROM_USERID === user.userId;
                                const isLastMyMsgRead = isMyMessage
                                    && msg.READFLG === 'Y'
                                    && (index === messages.length - 1 || messages[index + 1].FROM_USERID !== user.userId);

                                return (
                                    <Box key={msg.DM_ID} sx={{ mb: 1, textAlign: isMyMessage ? 'right' : 'left' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: 'inline-block',
                                                p: 1,
                                                backgroundColor: isMyMessage ? '#d0f0c0' : '#eee',
                                                borderRadius: 2,
                                                maxWidth: '70%',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {msg.MESSAGE}
                                        </Typography>
                                        {isLastMyMsgRead && (
                                            <Typography variant="caption" color="primary" sx={{ mt: 0.3, display: 'block' }}>
                                                방금 읽음
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="메시지를 입력하세요"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <IconButton onClick={sendMessage} color="primary">
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
                        대화를 시작하려면 대화방을 선택하세요.
                    </Typography>
                )}
            </Box>

            <FeedModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </Box>
    );
}

export default DmPage;
