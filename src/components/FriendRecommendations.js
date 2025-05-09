import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";


function FriendRecommendations({ user }) {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (user) {
            fetch("http://localhost:3005/profile/recommend/" + user.userId)
                .then(res => res.json())
                .then(data => setRecommendations(data))
                .catch(err => console.error("추천 친구 불러오기 실패", err));
        }
    }, [user]);


    const handleFollow = (toUserId) => {
        fetch("http://localhost:3005/follow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fromUserId: user.userId,  // 로그인한 내 계정
                toUserId      // 팔로우 대상
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ACCEPTED') {
                    alert("팔로우 완료!");
                } else if (data.status === 'PENDING') {
                    alert("팔로우 요청을 보냈습니다.");
                }
                // 성공 후 추천 목록에서 해당 항목 제거하거나 상태 표시 변경
                setRecommendations(prev =>
                    prev.map(user =>
                        user.userId === toUserId
                            ? { ...user, followed: true, followStatus: data.status }
                            : user
                    )
                );
            })
            .catch(err => {
                console.error("팔로우 실패", err);
                alert("팔로우 중 오류가 발생했습니다.");
            });
    };




    return (
        <Box mt={5} width="300px">
            <Typography variant="body2" fontWeight="bold" color="text.secondary" mb={2}>
                회원님을 위한 추천
            </Typography>
            {recommendations.map((rec, index) => (
                <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Box display="flex" alignItems="center">
                        <Avatar
                            src={rec.profileImg || "/default-profile.png"}
                            sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box>
                            <Typography variant="body2">{rec.userId}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {rec.userName}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        sx={{ textTransform: "none" }}
                        color="primary"
                        onClick={() => handleFollow(rec.userId)}
                        disabled={rec.followed}
                    >
                        {rec.followed
                            ? (rec.followStatus === "PENDING" ? "요청됨" : "팔로잉")
                            : "팔로우"}
                    </Button>

                </Box>
            ))}
        </Box>
    );
}

export default FriendRecommendations;
