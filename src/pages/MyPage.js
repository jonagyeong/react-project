import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Button, Grid, Paper, Dialog,
  DialogActions, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

import SideNavigation from "../components/SideNavigation";
import FeedModal from '../components/FeedModal'
import FeedDetailModal from '../components/FeedDetailModal';

function MyPage() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [user, setUser] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [ImgList, setImgList] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);

  const my = jwtDecode(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3005/profile/followers/" + my.userId)
      .then(res => res.json())
      .then(data => setFollowers(data));

    fetch("http://localhost:3005/profile/following/" + my.userId)
      .then(res => res.json())
      .then(data => setFollowing(data));

    fetch("http://localhost:3005/profile/" + my.userId)
      .then(res => res.json())
      .then(data => {
        setUser(data.info);
        setFeeds(data.FeedList);
      });
  }, [my.userId]);

  const handleFeedClick = (feed) => {
    setSelectedFeed(feed);
  };

  return (
    <Box sx={{ display: 'flex' }}>

      <SideNavigation />

      <Box sx={{ marginLeft: '200px', padding: '20px', width: '100%' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center',
          marginBottom: '20px', backgroundColor: '#fff',
          padding: '20px', borderRadius: '8px',
          justifyContent: 'center', margin: '0 auto', maxWidth: '800px'
        }}>
          <Avatar src="https://via.placeholder.com/150" sx={{ width: 150, height: 150, marginRight: '20px' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">@{my.userId}</Typography>
              <IconButton
                onClick={() => navigate('/settingpage')}
                sx={{ ml: 1 }}
                aria-label="설정"
              >
                <SettingsIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="textSecondary">{my.userName}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '200px' }}>
              {/* 팔로잉 숫자 클릭 시 모달 열기 */}
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setFollowingModalOpen(true)}
              >
                <strong>{following.length}</strong> 팔로우
              </Typography>

              {/* 팔로워 숫자 클릭 시 모달 열기 */}
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setFollowersModalOpen(true)}
              >
                <strong>{followers.length}</strong> 팔로워
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 피드 그리드 */}
        <Grid container spacing={2} sx={{ marginTop: '20px' }}>
          {feeds.length > 0 ? (
            feeds.map((feed, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{
                  width: '100%', height: 250,
                  backgroundColor: '#e4e4e4',
                  marginBottom: '20px', overflow: 'hidden'
                }}>
                  <img
                    src={`http://localhost:3005/feed/${feed.IMGNAME}`}
                    alt={`Post ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={() => handleFeedClick(feed)}
                  />
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body2">게시물이 없습니다.</Typography>
          )}
        </Grid>

        {/* 팔로워 모달 */}
        <Dialog open={followersModalOpen} onClose={() => setFollowersModalOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>
            팔로워
            <IconButton
              aria-label="close"
              onClick={() => setFollowersModalOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {followers.length === 0 && <Typography>팔로워가 없습니다.</Typography>}
            {followers.map((follower, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={follower.profileImg || "/default-profile.png"} sx={{ mr: 2 }} />
                <Typography>@{follower.userId}</Typography>
              </Box>
            ))}
          </DialogContent>
        </Dialog>

        {/* 팔로잉 모달 */}
        <Dialog open={followingModalOpen} onClose={() => setFollowingModalOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>
            팔로우 중
            <IconButton
              aria-label="close"
              onClick={() => setFollowingModalOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {following.length === 0 && <Typography>팔로우 중인 사람이 없습니다.</Typography>}
            {following.map((followedUser, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={followedUser.profileImg || "/default-profile.png"} sx={{ mr: 2 }} />
                <Typography>@{followedUser.userId}</Typography>
              </Box>
            ))}
          </DialogContent>
        </Dialog>

        <FeedModal />
        {selectedFeed && (
          <FeedDetailModal
            open={Boolean(selectedFeed)}
            onClose={() => setSelectedFeed(null)}
            selectedFeed={selectedFeed}
            feeds={feeds}
          />
        )}
      </Box>
    </Box>
  );
}

export default MyPage;
