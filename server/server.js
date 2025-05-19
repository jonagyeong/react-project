const express = require('express');
const db = require('./db');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');

const memberRouter = require('./routes/member');
const profileRouter = require('./routes/profile');
const feedRouter = require('./routes/feed');
const followRouter = require('./routes/follow');
const CloseFriendRouter = require('./routes/close_friend');
const DmRouter = require('./routes/dm');
const ReportRouter = require('./routes/report');
const BlockRouter = require('./routes/block');
const SearchRouter = require('./routes/search')

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use('/feed', express.static(path.join(__dirname, 'feed')));

// 라우터 등록
app.use("/member", memberRouter);
app.use("/profile", profileRouter);
app.use("/feed", feedRouter);
app.use("/follow", followRouter);
app.use("/close-friend", CloseFriendRouter);
app.use("/dm", DmRouter);
app.use("/block", BlockRouter);
app.use("/report", ReportRouter);
app.use("/search", SearchRouter);

// HTTP + WebSocket 서버 설정
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 소켓 유저 매핑
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("📡 소켓 연결됨:", socket.id);

    // 유저가 접속해서 자신의 userId 방에 join
    socket.on("join", (userId) => {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
        console.log(`🟢 유저 ${userId} 가 join 방에 참여함`);
    });

    // 대화방(room)에 입장하는 이벤트
    socket.on("joinRoom", async ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`📥 유저 ${userId} 가 방 ${roomId}에 입장`);

        // 방 입장 시 해당 방에서 읽음처리된 메시지 상태를 클라이언트에게 보냄
        try {
            // 읽음 상태가 'Y'인 메시지 개수나 최신 메시지 등 필요한 정보를 보내면 됨
            const readMessagesQuery = `
                SELECT DM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE
                FROM DM
                WHERE ROOM_ID = ?
                AND TO_USERID = ?
                AND READFLG = 'Y'
                ORDER BY REGDATE DESC
                LIMIT 1
            `;

            const [rows] = await db.query(readMessagesQuery, [roomId, userId]);

            if (rows.length > 0) {
                // 방금 읽음 상태 메시지 정보 보내기 (예: 마지막 읽은 메시지)
                socket.emit("readMessage", { roomId, userId, lastReadMessage: rows[0] });
            }
        } catch (err) {
            console.error("joinRoom 처리 중 읽음 상태 전송 에러:", err.message);
        }
    });

    // 메시지 전송
    // 메시지 전송
    socket.on("sendMessage", async ({ roomId, fromUserId, toUserId, message }) => {
        console.log("📨 sendMessage 이벤트 수신:", { roomId, fromUserId, toUserId, message });

        try {
            const insertQuery = `
        INSERT INTO DM (ROOM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE)
        VALUES (?, ?, ?, ?, 'N', NOW())`;
            const [result] = await db.query(insertQuery, [roomId, fromUserId, toUserId, message]);

            const selectQuery = `
        SELECT DM_ID, FROM_USERID, TO_USERID, MESSAGE, READFLG, REGDATE
        FROM DM WHERE DM_ID = ?`;
            const [rows] = await db.query(selectQuery, [result.insertId]);

            const msg = rows[0];
            const newMessage = { ...msg, roomId };

            io.to(toUserId).emit("newMessage", newMessage);
            io.to(fromUserId).emit("newMessage", newMessage);

            // ✅ [추가] 상대방이 현재 방에 있는 경우 → 곧바로 읽음 처리
            const room = io.sockets.adapter.rooms.get(roomId);
            if (room && room.size > 1) {
                // 즉, 최소 2명이 방에 있고 → 상대도 있는 것임
                const updateQuery = `
                UPDATE DM 
                SET READFLG = 'Y' 
                WHERE ROOM_ID = ? 
                AND TO_USERID = ?
                AND READFLG = 'N'`;
                await db.query(updateQuery, [roomId, toUserId]);

                // 보낸 사람에게도 읽음 이벤트 전달
                io.to(fromUserId).emit("readMessage", {
                    roomId,
                    userId: toUserId
                });
            }

        } catch (err) {
            console.error("메시지 저장 중 에러:", err.message);
        }
    });


    // 읽음 처리
    socket.on("readMessage", async ({ roomId, userId }) => {
        try {
            const updateQuery = `
            UPDATE DM 
            SET READFLG = 'Y' 
            WHERE ROOM_ID = ? 
            AND TO_USERID = ?
            AND READFLG = 'N'`;
            await db.query(updateQuery, [roomId, userId]);

            io.to(roomId).emit("readMessage", { roomId, userId });

        } catch (err) {
            console.error("읽음 처리 에러:", err.message);
        }
    });

    // 입력 중 (typing) 이벤트 처리
    socket.on("typing", ({ roomId, fromUserId, toUserId }) => {
        // 상대방에게 typing 이벤트 전달
        io.to(toUserId).emit("typing", { roomId, fromUserId });
    });

    socket.on("disconnect", () => {
        for (const userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                console.log("🔴 유저 연결 해제:", userId);
                break;
            }
        }
    });
});


// 서버 시작 (이제 app.listen이 아님!)
server.listen(3005, () => {
    console.log("🚀 서버 + 소켓 실행 중 on http://localhost:3005");
});
