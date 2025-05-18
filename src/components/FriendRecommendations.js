import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";

function FriendRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (user) {
      fetch("http://localhost:3005/profile/recommend/" + user.userId)
        .then((res) => res.json())
        .then((data) => setRecommendations(data))
        .catch((err) => console.error("추천 친구 불러오기 실패", err));
    }
  }, [user]);

  const handleFollow = (toUserId) => {
    fetch("http://localhost:3005/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: user.userId,
        toUserId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ACCEPTED") {
          alert("팔로우 완료!");
        } else if (data.status === "PENDING") {
          alert("팔로우 요청을 보냈습니다.");
        }
        setRecommendations((prev) =>
          prev.map((user) =>
            user.userId === toUserId
              ? { ...user, followed: true, followStatus: data.status }
              : user
          )
        );
      })
      .catch((err) => {
        console.error("팔로우 실패", err);
        alert("팔로우 중 오류가 발생했습니다.");
      });
  };

  return (
    <Box
      mt={5}
      sx={{
        position: "fixed",
        top: 80,
        right: 20,
        width: 300,
        bgcolor: "background.paper",
        boxShadow: "0 4px 12px rgb(0 0 0 / 0.15)",
        borderRadius: 3,
        p: 2,
        zIndex: 1301,
        maxHeight: "70vh",
        overflowY: "auto",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        color="text.secondary"
        mb={2}
        sx={{ letterSpacing: 0.5 }}
      >
        회원님을 위한 추천
      </Typography>

      {recommendations.map((rec, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
          sx={{
            cursor: "default",
            "&:hover": {
              bgcolor: "action.hover",
              borderRadius: 2,
            },
          }}
        >
          <Box display="flex" alignItems="center" minWidth={0}>
            <Avatar
              src={rec.profileImg || "/default-profile.png"}
              sx={{ width: 40, height: 40, mr: 2, flexShrink: 0 }}
            />
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                sx={{ color: "text.primary" }}
              >
                {rec.userId}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ fontSize: 12 }}
              >
                {rec.userName}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant={rec.followed ? "outlined" : "contained"}
            color={rec.followed ? "inherit" : "primary"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: rec.followed ? "grey.400" : undefined,
              color: rec.followed ? "text.secondary" : "#fff",
              minWidth: 80,
              borderRadius: 20,
              px: 1.5,
              "&:hover": {
                backgroundColor: rec.followed ? "rgba(0,0,0,0.04)" : undefined,
                borderColor: rec.followed ? "grey.600" : undefined,
              },
            }}
            onClick={() => handleFollow(rec.userId)}
            disabled={rec.followed}
          >
            {rec.followed
              ? rec.followStatus === "PENDING"
                ? "요청됨"
                : "팔로잉"
              : "팔로우"}
          </Button>
        </Box>
      ))}
    </Box>
  );
}

export default FriendRecommendations;
