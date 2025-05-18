import React, { useState, useEffect } from "react";
import {
    Box, Typography, TextField, Button, Avatar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Snackbar, Card, CardHeader, CardMedia, CardContent, IconButton, Radio, RadioGroup, FormControlLabel
} from "@mui/material";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';


import FriendRecommendations from "../components/FriendRecommendations";
import FeedModal from '../components/FeedModal';
import SideNavigation from "../components/SideNavigation";
import FeedDetailModal from "../components/FeedDetailModal";
import { getTimeAgo } from '../components/TimeAgo'; // 경로는 프로젝트 구조에 맞게 수정



function MainPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [feeds, setFeeds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [menuFeedId, setMenuFeedId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // ✅ anchorEl 상태 추가
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingFeed, setEditingFeed] = useState(null);
    const [viewType, setViewType] = useState("ALL"); // "ALL" 또는 "FRIEND" 선택
    const [menuFeed, setMenuFeed] = useState(null); // feed 정보를 저장할 상태 추가
    const [reportReason, setReportReason] = useState("");  // 신고 사유 상태 추가
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [likedFeeds, setLikedFeeds] = useState(new Set()); // 내가 좋아요한 피드 FEEDNO 집합
    const [likesCount, setLikesCount] = useState({});


    const navigate = useNavigate();

    const handleMenuOpen = (feed, event) => {
        setMenuFeed(feed);
        setMenuFeedId(feed.FEEDNO);
        setMenuOpen(true); // 팝업 열기
        setAnchorEl(event.currentTarget);// ✅ 클릭된 요소를 anchor로 지정
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuOpen(false); // 팝업 닫기
        setMenuFeedId(null);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    let user = null;
    console.log(user)
    const token = localStorage.getItem("token");
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (err) {
            console.error("토큰 디코딩 실패:", err);
        }
    }

    const fnFeedList = () => {
        fetch("http://localhost:3005/feed/list/" + user.userId)
            .then(res => res.json())
            .then(async (data) => {
                const filteredFeeds = data.list.filter(feed => {
                    if (viewType === "ALL") {
                        return feed.USERID !== user.userId && !data.blockedUsers.includes(feed.USERID);
                    } else if (viewType === "FRIEND") {
                        return feed.VISIBLE_SCOPE === "FRIEND" && feed.USERID !== user.userId && !data.blockedUsers.includes(feed.USERID);
                    }
                    return false;
                });
                // feeds 상태에는 피드 목록만 넣기
                setFeeds(filteredFeeds);

                // 좋아요 개수 비동기 요청
                const likesData = await Promise.all(filteredFeeds.map(async (feed) => {
                    try {
                        const res = await fetch(`http://localhost:3005/feed/${feed.FEEDNO}/likes/count`);
                        const likeData = await res.json();
                        return { feedNo: feed.FEEDNO, count: likeData.likeCount || 0 };
                    } catch (err) {
                        console.error("좋아요 개수 불러오기 실패:", err);
                        return { feedNo: feed.FEEDNO, count: 0 };
                    }
                }));

                // likesCount 객체 생성
                const likesCountObj = {};
                likesData.forEach(({ feedNo, count }) => {
                    likesCountObj[feedNo] = count;
                });
                setLikesCount(likesCountObj);

                // 피드 배열에 likesCount 포함시키기 (중요)
                const feedsWithLikes = filteredFeeds.map(feed => ({
                    ...feed,
                    likesCount: likesCountObj[feed.FEEDNO] || 0
                }));

                setFeeds(feedsWithLikes);

                // 내가 좋아요한 피드도 조회
                fetch("http://localhost:3005/feed/likes/" + user.userId)
                    .then(res => res.json())
                    .then(data => {
                        setLikedFeeds(new Set(data.Like.map(like => like.FEEDNO)));
                    });
            });
    };



    useEffect(() => {
        fnFeedList();
        console.log(viewType)
    }, [viewType]); // viewType이 변경될 때마다 피드 목록을 다시 가져옵니다.


    const handleLogout = () => {
        localStorage.removeItem("token");  // 토큰 삭제
        setSnackOpen(true);                 // 스낵바 보여주기
        setDialogOpen(false);               // 로그아웃 확인 다이얼로그 닫기
        setTimeout(() => {
            navigate("/");                  // 홈으로 이동
        }, 1500);                          // 스낵바 잠시 보여주고 이동
    };


    const handleFeedClick = (feed) => {
        setSelectedFeed(feed);
    };


    const handleLikeToggle = (feedNo) => {
        const hasLiked = likedFeeds.has(feedNo);

        if (hasLiked) {
            fetch("http://localhost:3005/feed/unlike", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedNo, userId: user.userId })
            })
                .then(res => res.json())
                .then(() => {
                    setLikedFeeds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(feedNo);
                        return newSet;
                    });
                    setFeeds(prevFeeds =>
                        prevFeeds.map(f =>
                            f.FEEDNO === feedNo ? { ...f, likesCount: f.likesCount - 1 } : f
                        )
                    );
                })
                .catch(console.error);
        } else {
            fetch("http://localhost:3005/feed/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedNo, userId: user.userId })
            })
                .then(res => res.json())
                .then(() => {
                    setLikedFeeds(prev => new Set(prev).add(feedNo));
                    setFeeds(prevFeeds =>
                        prevFeeds.map(f =>
                            f.FEEDNO === feedNo ? { ...f, likesCount: f.likesCount + 1 } : f
                        )
                    );
                })
                .catch(console.error);
        }
    };



    // 별 클릭 시 전체 공개/친구 공개 토글
    const handleViewChange = () => {
        setViewType(prevType => prevType === "ALL" ? "FRIEND" : "ALL");
    };


    const handleReportSubmit = () => {
        if (!menuFeed || !reportReason) return;

        const reportData = {
            report_type: "FEED",
            target_id: menuFeed.USERID,
            userID: user.userId,
            reason: reportReason
        };

        fetch("http://localhost:3005/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportData)
        })
            .then(res => res.json())
            .then(data => {
                alert("신고가 접수되었습니다.");
                setReportDialogOpen(false); // 신고 팝업 닫기
                handleMenuClose(); // 메뉴 닫기
            })
            .catch(err => {
                console.error("신고 실패", err);
            });
    };

    // 차단 요청 함수
    const handleBlock = (targetUserId) => {
        const blockData = {
            userId: user.userId,
            to_userid: targetUserId
        };

        fetch("http://localhost:3005/block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(blockData)
        })
            .then(res => res.json())
            .then(data => {
                alert("해당 사용자를 차단했습니다.");
                handleMenuClose();
                fnFeedList(); // 피드 목록 새로고침
            })
            .catch(err => {
                console.error("차단 실패", err);
            });
    };

    return (
        <Box display="flex">

            <SideNavigation handleOpenModal={handleOpenModal} />
            <Box
                flex={1}
                p={3}
                sx={{
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}>
                <Box sx={{ width: "100%", maxWidth: 450 }}>
                    {/* 초록색 별 버튼 클릭 시 전체 공개/친구 공개 토글 */}
                    <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                        <Typography sx={{ marginRight: "8px", fontWeight: "bold", color: viewType === "ALL" ? "gray" : "green" }}>
                            {viewType === "ALL" ? "전체" : "친한 친구"}
                        </Typography>
                        <IconButton onClick={handleViewChange}>
                            <StarIcon
                                sx={{
                                    fontSize: 25,
                                    borderRadius: "50%", // 원 형태로 만듦
                                    color: viewType === "ALL" ? "gray" : "green", // 아이콘 색상
                                    border: "2px solid", // 테두리 두께
                                    borderColor: viewType === "ALL" ? "gray" : "green", // 테두리 색상
                                    padding: "4px", // 아이콘과 원 테두리 간격 추가
                                }}
                            />
                        </IconButton>
                    </Box>


                    {feeds.length === 0 ? (
                        <Typography variant="body2">피드를 불러오는 중입니다...</Typography>
                    ) : (
                        feeds.map((feed, index) => (
                            <Card
                                key={index}
                                sx={{ marginBottom: 4 }}
                                elevation={0}
                                onClick={() => handleFeedClick(feed)}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar
                                            src={"/default-profile.png"}
                                            sx={{ width: 32, height: 32, mr: 1 }}
                                        />
                                    }
                                    action={
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleMenuOpen(feed, e); }}>
                                            <Typography fontSize="24px">⋯</Typography>
                                        </IconButton>
                                    }
                                    title={
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 카드 클릭 이벤트 막기
                                                navigate(`/otherpage?userId=${feed.USERID}`);
                                            }}
                                        >
                                            @{feed.USERID} <span style={{ color: '#999' }}>· {getTimeAgo(feed.REGDATE)}</span>
                                        </Typography>
                                    }

                                />
                                {feed.IMGNAME && (
                                    <CardMedia
                                        component="img"
                                        height="400"
                                        image={`http://localhost:3005/feed/${feed.IMGNAME}`}
                                        alt="피드 이미지"
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                                        {feed.CONTENT}
                                    </Typography>
                                    {feed.hashtag && feed.hashtag.length > 0 && (
                                        <Box sx={{ marginBottom: 1 }}>
                                            {feed.hashtag.map((tag, idx) => (
                                                <Typography
                                                    key={idx}
                                                    variant="body2"
                                                    component="span"
                                                    sx={{ color: '#1976d2', marginRight: 1, cursor: 'pointer' }}

                                                >
                                                    #{tag}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    <Box display="flex" alignItems="center">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // 카드 클릭 이벤트 방지
                                                handleLikeToggle(feed.FEEDNO);
                                            }}
                                        >
                                            <FavoriteIcon color={likedFeeds.has(feed.FEEDNO) ? "error" : "disabled"} />
                                        </IconButton>
                                        <Typography variant="body2" sx={{ marginLeft: 1 }}>
                                            {feed.likesCount || 0} Likes
                                        </Typography>

                                    </Box>

                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>

                {/* 신고 사유 선택 팝업 */}
                <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
                    <DialogTitle>신고 사유 선택</DialogTitle>
                    <DialogContent>
                        <DialogContentText>해당 피드를 신고하려는 이유를 선택해주세요.</DialogContentText>
                        <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                            <FormControlLabel value="부적절한 콘텐츠" control={<Radio />} label="부적절한 콘텐츠" />
                            <FormControlLabel value="허위 정보" control={<Radio />} label="허위 정보" />
                            <FormControlLabel value="혐오 발언" control={<Radio />} label="혐오 발언" />
                            <FormControlLabel value="기타" control={<Radio />} label="기타" />
                        </RadioGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReportDialogOpen(false)} color="primary">취소</Button>
                        <Button onClick={handleReportSubmit} color="primary">신고</Button>
                    </DialogActions>
                </Dialog>


                {searchOpen && (
                    <Box mt={3}>
                        <TextField variant="outlined" label="검색" fullWidth />
                    </Box>
                )}
            </Box>

            {user && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        zIndex: 1301
                    }}
                >
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                            src={user.profileImg || "/default-profile.png"}
                            alt={user.userName}
                            sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box mr={2}>
                            <Typography variant="body2"><strong>{user.userId}</strong></Typography>
                            <Typography variant="caption" color="textSecondary">{user.userName}</Typography>
                        </Box>
                        <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)} style={{ color: "#5C87C3", border: "1px solid #5C87C3" }}>로그아웃</Button>
                    </Box>
                    <Box>
                        <FriendRecommendations user={user} />
                    </Box>
                </Box>
            )}

            <FeedModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditMode(false);
                    setEditingFeed(null);
                }}
                fnFeedList={fnFeedList}
                editMode={editMode}
                editingFeed={editingFeed}
            />
            <Dialog open={dialogOpen}>
                <DialogTitle>로그아웃 확인</DialogTitle>
                <DialogContent>
                    <DialogContentText>정말 로그아웃하시겠습니까?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>취소</Button>
                    <Button onClick={handleLogout} color="error">로그아웃</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackOpen}
                autoHideDuration={2000}
                onClose={() => setSnackOpen(false)}
                message="로그아웃 되었습니다."
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 1301 }}
            />

            {selectedFeed && (
                <FeedDetailModal
                    open={Boolean(selectedFeed)}
                    onClose={() => setSelectedFeed(null)}
                    selectedFeed={selectedFeed}
                />
            )}

            <Dialog open={menuOpen} onClose={handleMenuClose}>
                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                        minWidth: '280px'
                    }}
                >
                    <>
                        <Button fullWidth onClick={() => { setReportDialogOpen(true) }} style={{ color: "red" }}>신고</Button>
                        <Button fullWidth onClick={() => {
                            console.log("팔로우/팔로우 해제 클릭");
                            handleMenuClose();
                        }}>팔로우/팔로우 해제</Button>
                        <Button fullWidth onClick={handleBlock} style={{ color: "red" }}>차단</Button>
                    </>

                    <Button fullWidth onClick={handleMenuClose} style={{ marginTop: '8px', color: 'gray' }}>
                        취소
                    </Button>
                </DialogContent>
            </Dialog>




        </Box>
    );
}

export default MainPage;
