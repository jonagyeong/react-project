import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, Button, Grid, Paper } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#fafafa', // 배경색을 인스타 스타일에 맞게 설정
        padding: '20px',
        minHeight: '100vh',
        maxWidth: '1100px',
        margin: '0 auto', // 중앙 정렬
    },
    profileHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)', // 인스타 스타일의 그림자 효과
    },
    profileImage: {
        width: 150, // 프로필 이미지 크기
        height: 150,
        borderRadius: '50%',
        marginRight: '20px',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    followStats: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        width: '200px',
    },
    postGrid: {
        marginTop: '20px',
    },
    post: {
        width: '100%',
        height: 250,
        backgroundColor: '#e4e4e4', // 게시물 배경색
        borderRadius: '8px',
        marginBottom: '20px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', // 그림자 효과
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)', // 팔로우/팔로워 카드 그림자
        marginBottom: '10px',
    },
    button: {
        marginTop: '10px',
    },
    postImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
}));

function MyPage() {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const my = jwtDecode(localStorage.getItem("token"));
    const classes = useStyles();

    useEffect(() => {
        fetch("http://localhost:3005/profile/followers/" + my.userId)
            .then(res => res.json())
            .then(data => setFollowers(data));

        fetch("http://localhost:3005/profile/following/" + my.userId)
            .then(res => res.json())
            .then(data => setFollowing(data));
    }, [my.userId]);


    return (
        <div className={classes.root}>

            {/* 프로필 헤더 */}
            <Box className={classes.profileHeader}>
                <Avatar
                    src="https://via.placeholder.com/150"
                    className={classes.profileImage}
                />
                <Box className={classes.userInfo}>
                    <Typography variant="h5" fontWeight="bold">
                        {my.userId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {my.userName}
                    </Typography>
                    <Box className={classes.followStats}>
                        <Typography variant="body2">
                            <strong>{followers.length}</strong> 팔로워
                        </Typography>
                        <Typography variant="body2">
                            <strong>{following.length}</strong> 팔로우
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                    >
                        팔로우
                    </Button>
                </Box>
            </Box>

            {/* 팔로워 목록 */}
            <Box mt={4}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    팔로워 목록
                </Typography>
                <Box>
                    {followers.map((f) => (
                        <Box key={f.userId} className={classes.listItem}>
                            <Typography variant="body2">{f.userName}</Typography>
                            <Button variant="outlined" size="small">
                                팔로우
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* 팔로우 목록 */}
            <Box mt={4}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                    팔로우 목록
                </Typography>
                <Box>
                    {following.map((f) => (
                        <Box key={f.userId} className={classes.listItem}>
                            <Typography variant="body2">{f.userName}</Typography>
                            <Button variant="outlined" size="small">
                                팔로우 중
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* 게시물 섹션 */}
            <Grid container spacing={2} className={classes.postGrid}>
                {[...Array(6)].map((_, index) => (
                    <Grid item xs={4} key={index}>
                        <Paper className={classes.post}>
                            <img
                                src={`https://via.placeholder.com/300x250?text=Post+${index + 1}`}
                                alt={`Post ${index + 1}`}
                                className={classes.postImage}
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default MyPage;
