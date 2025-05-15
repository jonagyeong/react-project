import React, { useState, useEffect, useRef, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';  // jwtDecode는 default export임 (수정)
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
    const [typingUserId, setTypingUserId] = useState(null);

    const messagesEndRef = useRef(null);

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
    const typingTimeoutRef = useRef(null);
    const typingEmitTimeoutRef = useRef(null);

    // 소켓 연결 및 이벤트 등록
    useEffect(() => {
        if (!user?.userId) return;

        const socket = io("http://localhost:3005", { transports: ['websocket'] });
        socketRef.current = socket;

        socket.emit('join', user.userId);

        // 새 메시지 수신 시 처리
        socket.on('newMessage', (data) => {
            if (!data.MESSAGE) {
                console.warn('⚠️ 메시지 내용이 비어 있습니다:', data);
                return;
            }

            if (data.roomId === selectedRoomId) {
                setMessages(prev => [...prev, data]);
                // 새 메시지 받으면 즉시 읽음 처리 emit 및 방 목록 갱신
                setTypingUserId(null);

                // 남아있는 타이머가 있으면 클리어
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                } // 여기서 입력중 표시 제거
                socket.emit('readMessage', { roomId: data.roomId, userId: user.userId });
                fetchMyRooms();
            } else {
                fetchMyRooms();
            }
        });

        socket.on('readMessage', ({ roomId, userId: readerId }) => {
            console.log('🔔 [소켓] readMessage 이벤트 수신:', roomId, readerId);

            if (roomId === selectedRoomId && readerId !== user.userId) {
                setMessages(prevMsgs => {
                    const newMsgs = [...prevMsgs];
                    for (let i = newMsgs.length - 1; i >= 0; i--) {
                        const msg = newMsgs[i];
                        if (msg.FROM_USERID === user.userId && msg.READFLG !== 'Y') {
                            newMsgs[i] = { ...msg, READFLG: 'Y' };
                            break;
                        }
                    }

                    // ✅ 루프 바깥에서 로그 찍기
                    console.log('📝 메시지 업데이트 전:', prevMsgs);
                    console.log('📝 메시지 업데이트 후:', newMsgs);

                    return newMsgs;
                });
            }
        });




        // 상대방 타이핑 이벤트 수신
        socket.on('typing', ({ roomId, fromUserId }) => {
            if (roomId === selectedRoomId && fromUserId !== user.userId) {
                setTypingUserId(fromUserId);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, selectedRoomId]);

    // 방 목록 초기 로드 및 갱신
    useEffect(() => {
        if (user?.userId) {
            fetchMyRooms();
        }
    }, [user]);

    // 메시지 수신 시 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMyRooms = () => {
        fetch(`http://localhost:3005/dm/rooms/${user.userId}`)
            .then(res => res.json())
            .then(data => {
                const uniqueRooms = data.rooms.filter((room, index, self) =>
                    index === self.findIndex(r => r.ROOM_ID === room.ROOM_ID)
                );
                setRooms(uniqueRooms);
            })
            .catch(err => console.error('방 조회 실패:', err));
    };

    // 특정 방 메시지 조회 + 읽음 처리
    const fetchMessages = async (roomId) => {
        if (!user?.userId) return;

        try {
            // 서버의 읽음 API는 POST이므로 body와 method 명시 필요
            await fetch(`http://localhost:3005/dm/read/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.userId }),
            });

            // 읽음 처리 소켓 이벤트 전송
            socketRef.current?.emit('readMessage', { roomId, userId: user.userId });

            // 메시지 목록 조회
            const res = await fetch(`http://localhost:3005/dm/message/${roomId}`);
            const data = await res.json();

            setMessages(data.DMmessage || []);
            setSelectedRoomId(roomId);
            fetchMyRooms();
        } catch (err) {
            console.error('메시지 조회 실패:', err);
        }
    };

    // 타이핑 이벤트 emit (500ms 디바운스)
    const handleTyping = () => {
        if (!selectedRoomId || !user?.userId) return;

        if (typingEmitTimeoutRef.current) return;

        typingEmitTimeoutRef.current = setTimeout(() => {
            const room = rooms.find(r => r.ROOM_ID === selectedRoomId);
            if (!room) {
                typingEmitTimeoutRef.current = null;
                return;
            }
            const toUserId = room.USERID;

            socketRef.current?.emit('typing', {
                roomId: selectedRoomId,
                fromUserId: user.userId,
                toUserId
            });
            typingEmitTimeoutRef.current = null;
        }, 500);
    };

    // 메시지 입력 onChange 핸들러
    const onChangeMessage = (e) => {
        setNewMessage(e.target.value);
        handleTyping();
    };

    // 메시지 전송 함수
    const sendMessage = () => {
        if (!newMessage.trim() || !selectedRoomId || !user?.userId) return;

        const messageToSend = newMessage.trim();
        const room = rooms.find(r => r.ROOM_ID === selectedRoomId);
        if (!room) return;

        const toUserId = room.USERID;

        socketRef.current?.emit('sendMessage', {
            roomId: selectedRoomId,
            fromUserId: user.userId,
            toUserId,
            message: messageToSend,
        });
        setNewMessage('');
        setTypingUserId(null);
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
                <Typography gutterBottom sx={{ fontSize: '15px', marginBottom: 5 }}>{user?.userId}</Typography>
                <Typography gutterBottom sx={{ fontSize: '15px', color: 'gray', fontWeight: 'bold' }}>메시지</Typography>
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
                                            </Typography>)} </Box>);
                            })} <div ref={messagesEndRef} /> </Box>
                        {typingUserId && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                {typingUserId}님이 입력 중입니다...
                            </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="메시지를 입력하세요"
                                value={newMessage}
                                onChange={onChangeMessage}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <IconButton onClick={sendMessage}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Typography variant="h6" color="text.secondary">대화를 선택하세요</Typography>
                )}
            </Box>

            <FeedModal open={modalOpen} handleClose={() => setModalOpen(false)} />
        </Box>
    );
}

export default DmPage;