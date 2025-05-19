-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- project 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `project`;

-- 테이블 project.alarm 구조 내보내기
CREATE TABLE IF NOT EXISTS `alarm` (
  `ALARM_ID` int NOT NULL AUTO_INCREMENT,
  `USERID` varchar(255) NOT NULL,
  `FROM_USERID` varchar(255) NOT NULL,
  `TYPE` varchar(50) NOT NULL,
  `TARGET_ID` varchar(255) NOT NULL,
  `IS_READ` varchar(1) DEFAULT 'N',
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ALARM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.alarm:~0 rows (대략적) 내보내기

-- 테이블 project.block 구조 내보내기
CREATE TABLE IF NOT EXISTS `block` (
  `USERID` varchar(255) NOT NULL,
  `TO_USERID` varchar(255) NOT NULL,
  PRIMARY KEY (`USERID`,`TO_USERID`),
  UNIQUE KEY `UNIQUE_BLOCK` (`USERID`,`TO_USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.block:~1 rows (대략적) 내보내기
INSERT INTO `block` (`USERID`, `TO_USERID`) VALUES
	('test', 'user2');

-- 테이블 project.close_friend 구조 내보내기
CREATE TABLE IF NOT EXISTS `close_friend` (
  `USERID` varchar(255) NOT NULL,
  `FRIEND_USERID` varchar(255) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`USERID`,`FRIEND_USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.close_friend:~2 rows (대략적) 내보내기
INSERT INTO `close_friend` (`USERID`, `FRIEND_USERID`, `REGDATE`) VALUES
	('user2', 'user1', '2025-05-14 02:55:39'),
	('user2', 'user3', '2025-05-14 03:09:12');

-- 테이블 project.comment 구조 내보내기
CREATE TABLE IF NOT EXISTS `comment` (
  `COMMENT_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` varchar(255) DEFAULT NULL,
  `CONTENT` text,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `PARENT_ID` int DEFAULT NULL,
  PRIMARY KEY (`COMMENT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.comment:~0 rows (대략적) 내보내기

-- 테이블 project.comment_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `comment_like` (
  `COMMENT_LIKE_ID` int NOT NULL AUTO_INCREMENT,
  `COMMENT_ID` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`COMMENT_LIKE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.comment_like:~0 rows (대략적) 내보내기

-- 테이블 project.dm 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm` (
  `DM_ID` int NOT NULL AUTO_INCREMENT,
  `FROM_USERID` varchar(255) NOT NULL,
  `TO_USERID` varchar(255) NOT NULL,
  `MESSAGE` text,
  `READFLG` varchar(1) DEFAULT 'N',
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ROOM_ID` int NOT NULL,
  PRIMARY KEY (`DM_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm:~36 rows (대략적) 내보내기
INSERT INTO `dm` (`DM_ID`, `FROM_USERID`, `TO_USERID`, `MESSAGE`, `READFLG`, `REGDATE`, `ROOM_ID`) VALUES
	(1, 'test', 'user1', '안녕 user1!', 'Y', '2025-05-14 03:51:13', 1),
	(2, 'user1', 'test', '안녕 test!', 'Y', '2025-05-14 03:51:14', 1),
	(3, 'test', 'user2', '하이 user2!', 'Y', '2025-05-14 03:51:13', 2),
	(4, 'user2', 'test', '하이하이!', 'Y', '2025-05-14 03:51:14', 2),
	(73, 'test', 'user1', '테스트', 'Y', '2025-05-15 08:20:46', 1),
	(74, 'test', 'user1', '테스트', 'Y', '2025-05-15 08:24:25', 1),
	(75, 'test', 'user1', '1', 'Y', '2025-05-15 08:40:49', 1),
	(76, 'test', 'user1', '1', 'Y', '2025-05-15 08:40:49', 1),
	(77, 'user1', 'test', '1', 'Y', '2025-05-15 08:45:15', 1),
	(78, 'user1', 'test', '2', 'Y', '2025-05-15 08:45:30', 1),
	(79, 'test', 'user1', '4', 'Y', '2025-05-15 08:45:33', 1),
	(80, 'user1', 'test', '12334', 'Y', '2025-05-15 08:55:48', 1),
	(81, 'user1', 'test', '123', 'Y', '2025-05-15 09:08:01', 1),
	(82, 'test', 'user1', '123', 'Y', '2025-05-15 09:08:05', 1),
	(83, 'user1', 'test', '123', 'Y', '2025-05-15 09:08:10', 1),
	(84, 'test', 'user1', '123', 'Y', '2025-05-15 09:08:15', 1),
	(85, 'user1', 'test', '읽기 테스트', 'Y', '2025-05-15 09:10:34', 1),
	(86, 'user1', 'test', '표시테스트', 'Y', '2025-05-15 09:14:41', 1),
	(87, 'user1', 'test', '2', 'Y', '2025-05-15 09:15:26', 1),
	(88, 'test', 'user1', '1', 'Y', '2025-05-15 09:15:29', 1),
	(89, 'user1', 'test', '표시 테스트', 'Y', '2025-05-15 09:16:56', 1),
	(90, 'test', 'user1', '읽는거 테스트', 'Y', '2025-05-15 09:17:06', 1),
	(91, 'test', 'user1', '표시', 'Y', '2025-05-15 09:18:26', 1),
	(92, 'user1', 'test', '읽음', 'Y', '2025-05-15 09:18:32', 1),
	(93, 'user1', 'test', '보내기', 'Y', '2025-05-15 09:21:00', 1),
	(94, 'test', 'user1', '읽었음', 'Y', '2025-05-15 09:21:08', 1),
	(95, 'user1', 'test', '보내기', 'Y', '2025-05-15 09:21:40', 1),
	(96, 'test', 'user1', '테스트해보기', 'Y', '2025-05-15 09:24:39', 1),
	(97, 'user1', 'test', '테스트', 'Y', '2025-05-15 09:24:47', 1),
	(98, 'test', 'user1', '읽기 표시', 'Y', '2025-05-15 09:27:28', 1),
	(99, 'user1', 'test', '읽기표시', 'Y', '2025-05-15 09:27:39', 1),
	(100, 'test', 'user1', '1', 'Y', '2025-05-15 09:27:49', 1),
	(101, 'user1', 'test', '보내기', 'Y', '2025-05-15 09:28:18', 1),
	(102, 'test', 'user1', '보내기', 'Y', '2025-05-15 09:28:22', 1),
	(103, 'test', 'user1', '테스트', 'Y', '2025-05-15 09:37:12', 1),
	(104, 'user1', 'test', '테스트', 'Y', '2025-05-15 09:37:15', 1);

-- 테이블 project.dm_img 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_img` (
  `DM_IMGNO` int NOT NULL AUTO_INCREMENT,
  `DM_ID` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `IMGNAME` varchar(255) NOT NULL,
  `IMGPATH` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`DM_IMGNO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_img:~0 rows (대략적) 내보내기

-- 테이블 project.dm_member 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_member` (
  `ROOM_ID` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  PRIMARY KEY (`ROOM_ID`,`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_member:~4 rows (대략적) 내보내기
INSERT INTO `dm_member` (`ROOM_ID`, `USERID`) VALUES
	(1, 'test'),
	(1, 'user1'),
	(2, 'test'),
	(2, 'user2');

-- 테이블 project.dm_room 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_room` (
  `ROOM_ID` int NOT NULL AUTO_INCREMENT,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ROOM_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_room:~2 rows (대략적) 내보내기
INSERT INTO `dm_room` (`ROOM_ID`, `CREATED_AT`) VALUES
	(1, '2025-05-14 03:51:13'),
	(2, '2025-05-14 03:51:13');

-- 테이블 project.feed 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed` (
  `FEEDNO` int NOT NULL AUTO_INCREMENT,
  `USERID` varchar(255) NOT NULL,
  `CONTENT` varchar(255) DEFAULT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `VISIBLE_SCOPE` varchar(20) DEFAULT 'ALL',
  `LOCATION` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`FEEDNO`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed:~17 rows (대략적) 내보내기
INSERT INTO `feed` (`FEEDNO`, `USERID`, `CONTENT`, `REGDATE`, `VISIBLE_SCOPE`, `LOCATION`) VALUES
	(26, 'user1', 'test', '2025-05-12 08:18:05', 'ALL', 'test'),
	(27, 'user1', '친한 친구만', '2025-05-12 08:26:55', 'FRIEND', ''),
	(28, 'user1', 'test', '2025-05-13 01:22:58', 'FRIEND', NULL),
	(30, 'user1', '해시태그', '2025-05-13 01:35:30', 'FRIEND', NULL),
	(31, 'user1', 'test', '2025-05-13 01:50:12', 'FRIEND', NULL),
	(32, 'user1', 'test', '2025-05-13 01:50:27', 'FRIEND', NULL),
	(38, 'user2', '수정 테스트(수정)', '2025-05-13 07:09:39', 'FRIEND', ''),
	(40, 'user2', '테스트', '2025-05-13 07:15:33', 'ALL', ''),
	(41, 'user2', '전체 공개', '2025-05-13 08:22:51', 'ALL', ''),
	(42, 'user2', '친한 친구 공개', '2025-05-13 08:23:20', 'FRIEND', ''),
	(43, 'user3', '데이터', '2025-05-13 08:27:13', 'FRIEND', ''),
	(44, 'user3', '테스트', '2025-05-13 08:27:29', 'FRIEND', ''),
	(45, 'user2', '설정페이지에서 작성', '2025-05-14 03:47:11', 'ALL', ''),
	(46, 'user2', '설정페이지에서 작성(다시)', '2025-05-14 03:48:26', 'ALL', ''),
	(47, 'user2', '환경설정 페이지에서 작성', '2025-05-14 03:48:45', 'ALL', ''),
	(48, 'user1', '친한 친구', '2025-05-18 16:05:03', 'FRIEND', ''),
	(49, 'user1', '전체', '2025-05-18 16:05:20', 'ALL', '');

-- 테이블 project.feed_bookmark 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_bookmark` (
  `BOOKMARK_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`BOOKMARK_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed_bookmark:~0 rows (대략적) 내보내기

-- 테이블 project.feed_hashtag 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_hashtag` (
  `FEEDNO` int NOT NULL,
  `TAG` varchar(255) NOT NULL,
  PRIMARY KEY (`FEEDNO`,`TAG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed_hashtag:~3 rows (대략적) 내보내기
INSERT INTO `feed_hashtag` (`FEEDNO`, `TAG`) VALUES
	(30, '테스트'),
	(30, '해시태그'),
	(31, 'test');

-- 테이블 project.feed_img 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_img` (
  `FEED_IMGNO` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `IMGNAME` varchar(255) NOT NULL,
  `IMGPATH` varchar(255) DEFAULT NULL,
  `THUMBNAILYN` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`FEED_IMGNO`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed_img:~21 rows (대략적) 내보내기
INSERT INTO `feed_img` (`FEED_IMGNO`, `FEEDNO`, `USERID`, `IMGNAME`, `IMGPATH`, `THUMBNAILYN`) VALUES
	(19, 26, 'user1', '1747037885666-coding-926242_1920.jpg', 'feed/', 'Y'),
	(20, 27, 'user1', '1747038415166-img.jpg', 'feed/', 'Y'),
	(21, 28, 'user1', '1747099378592-img2.jpg', 'feed/', 'Y'),
	(22, 29, 'user1', '1747100020483-wave.jpg', 'feed/', 'Y'),
	(23, 30, 'user1', '1747100130114-jpg2.jpg', 'feed/', 'Y'),
	(24, 30, 'user1', '1747100130119-jpg1.jpg', 'feed/', 'N'),
	(25, 30, 'user1', '1747100130125-img1.jpg', 'feed/', 'N'),
	(26, 30, 'user1', '1747100130126-wave.jpg', 'feed/', 'N'),
	(27, 31, 'user1', '1747101012608-BOX1.jpg', 'feed/', 'Y'),
	(28, 32, 'user1', '1747101027886-coding-926242_1920.jpg', 'feed/', 'Y'),
	(34, 38, 'user2', '1747116308688-BOX2.jpg', 'feed/', 'Y'),
	(35, 40, 'user2', '1747120533424-freepik__background__38619.png', 'feed/', 'Y'),
	(36, 41, 'user2', '1747124571752-img.jpg', 'feed/', 'Y'),
	(37, 42, 'user2', '1747124600143-img2.jpg', 'feed/', 'Y'),
	(38, 43, 'user3', '1747124833527-park1.jpg', 'feed/', 'Y'),
	(39, 44, 'user3', '1747124849348-pizza-3010062_1920.jpg', 'feed/', 'Y'),
	(40, 45, 'user2', '1747194431044-profil.png.png', 'feed/', 'Y'),
	(41, 46, 'user2', '1747194506549-profil.png.png', 'feed/', 'Y'),
	(42, 47, 'user2', '1747194525422-pasta-1181189_1920.jpg', 'feed/', 'Y'),
	(43, 48, 'user1', '1747584303950-free-icon-salad-1610000.png', 'feed/', 'Y'),
	(44, 49, 'user1', '1747584320089-free-icon-lunchbox-5305590.png', 'feed/', 'Y');

-- 테이블 project.feed_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_like` (
  `LIKE_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LIKE_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed_like:~2 rows (대략적) 내보내기
INSERT INTO `feed_like` (`LIKE_ID`, `FEEDNO`, `USERID`, `REGDATE`) VALUES
	(2, 46, 'user1', '2025-05-18 15:33:58'),
	(5, 47, 'user1', '2025-05-18 16:03:59');

-- 테이블 project.feed_share 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_share` (
  `SHARE_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `SHARE_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SHARE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.feed_share:~0 rows (대략적) 내보내기

-- 테이블 project.follow 구조 내보내기
CREATE TABLE IF NOT EXISTS `follow` (
  `FOLLOW_ID` int NOT NULL AUTO_INCREMENT,
  `FROM_USERID` varchar(255) NOT NULL,
  `TO_USERID` varchar(255) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `STATUS` enum('ACCEPTED','PENDING','REJECTED') DEFAULT 'ACCEPTED',
  PRIMARY KEY (`FOLLOW_ID`),
  UNIQUE KEY `UNIQUE_FOLLOW` (`FROM_USERID`,`TO_USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.follow:~10 rows (대략적) 내보내기
INSERT INTO `follow` (`FOLLOW_ID`, `FROM_USERID`, `TO_USERID`, `REGDATE`, `STATUS`) VALUES
	(2, 'user2', 'user3', '2025-05-09 06:41:23', 'ACCEPTED'),
	(3, 'user3', 'user2', '2025-05-09 08:34:45', 'ACCEPTED'),
	(4, 'user2', 'test', '2025-05-13 07:03:29', 'ACCEPTED'),
	(5, 'user1', 'user2', '2025-05-14 02:40:24', 'ACCEPTED'),
	(6, 'user1', 'user3', '2025-05-14 02:40:26', 'ACCEPTED'),
	(7, 'user2', 'user1', '2025-05-14 02:40:37', 'ACCEPTED'),
	(8, 'user1', 'test', '2025-05-14 07:11:14', 'ACCEPTED'),
	(17, 'user8', 'user3', '2025-05-14 09:05:57', 'ACCEPTED'),
	(19, 'user8', 'user2', '2025-05-14 09:14:18', 'PENDING'),
	(20, 'user2', 'user6', '2025-05-18 17:01:00', 'ACCEPTED');

-- 테이블 project.member 구조 내보내기
CREATE TABLE IF NOT EXISTS `member` (
  `USERID` varchar(30) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `USERNAME` varchar(50) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`USERID`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.member:~11 rows (대략적) 내보내기
INSERT INTO `member` (`USERID`, `EMAIL`, `PASSWORD`, `USERNAME`, `REGDATE`) VALUES
	('test', 'test@test.com', '$2b$10$2r/CBVxkrjHg0WXIs9OEe.fUCyF0eL4DI.Dnv9Wfk9F.F9VxJ3zHm', '테스트', '2025-05-09 06:05:27'),
	('user1', 'user1@user1.com', '$2b$10$1q8KDIAlq7hO64mQ5mwOWeDC.W/Nw.tyGFhJFXArx9NXlqYQVqoOi', '유저1', '2025-05-09 06:10:54'),
	('user10', 'user10@user10.com', '$2b$10$dgumMCbe2BEUeTas1LXnp.esX7pvjraURS/oAiKoqMTz6FyLQvWGC', '유저10', '2025-05-14 07:55:58'),
	('user2', 'user2@user2.com', '$2b$10$7dag3kHp9ygxEu3X8x5imOrkmVryZTARKzN45hOaZbmZS0jnyVFm.', '유저2', '2025-05-09 06:11:20'),
	('user3', 'user3@user3.com', '$2b$10$pAQeOLmhJqI/bQl.Jbsyy.bA9vKMSGCYlDZiAFjdKufiHFQUy7uh2', '유저3', '2025-05-09 06:11:45'),
	('user4', 'user4@user4.com', '$2b$10$MAEGTbfaD6vxAU5lFglUMOFk/rN4GZPIbXhcg9X7CtBMzztIQsB9K', '유저4', '2025-05-14 07:54:10'),
	('user5', 'user5@user5.com', '$2b$10$FQwjpSh9Prbv/8BnjS8FO.aFiVPrTw/3JzoCdIfM2yVKVcOawFagy', '유저5', '2025-05-14 07:54:24'),
	('user6', 'user6@user6.com', '$2b$10$TsbfyeZGzH6HPzZ/rVPr1eYWBgTpDKiMAVOOp4JEmwhaEQIyCwgBy', '유저6', '2025-05-14 07:54:55'),
	('user7', 'user7@user7.com', '$2b$10$2oO.dUaEa/U5KCwTPIImWuTCdENKkFJmrVLtKqQLjPaeug/bkVeF6', '유저7', '2025-05-14 07:55:11'),
	('user8', 'user8@user8.com', '$2b$10$FxWqJcTJapeXqlbGsU9Mmu8hCSCS0W17iBRMO/J7udfvAc/a2WD8S', '유저8', '2025-05-14 07:55:27'),
	('user9', 'user9@user9.com', '$2b$10$krPJAV/CDQE4wGnCv7Dgvuj6grpYDhpxqy5jQGkZEg6aSa0mtPFli', '유저9', '2025-05-14 07:55:45');

-- 테이블 project.mention 구조 내보내기
CREATE TABLE IF NOT EXISTS `mention` (
  `MENTION_ID` int NOT NULL AUTO_INCREMENT,
  `TARGET_USERID` varchar(255) NOT NULL,
  `MENTION_TYPE` varchar(50) NOT NULL,
  `CONTENT_ID` int NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MENTION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.mention:~0 rows (대략적) 내보내기

-- 테이블 project.profile 구조 내보내기
CREATE TABLE IF NOT EXISTS `profile` (
  `USERID` varchar(255) NOT NULL,
  `ADDRESS` varchar(255) DEFAULT NULL,
  `PHONE` varchar(20) DEFAULT NULL,
  `BIRTH` date DEFAULT NULL,
  `INTRO` text,
  `PROFILEIMG` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PRIVATE_YN` varchar(1) DEFAULT 'N',
  PRIMARY KEY (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.profile:~11 rows (대략적) 내보내기
INSERT INTO `profile` (`USERID`, `ADDRESS`, `PHONE`, `BIRTH`, `INTRO`, `PROFILEIMG`, `PRIVATE_YN`) VALUES
	('test', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user1', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user10', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user2', NULL, NULL, NULL, NULL, NULL, 'Y'),
	('user3', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user4', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user5', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user6', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user7', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user8', NULL, NULL, NULL, NULL, NULL, 'N'),
	('user9', NULL, NULL, NULL, NULL, NULL, 'N');

-- 테이블 project.report 구조 내보내기
CREATE TABLE IF NOT EXISTS `report` (
  `REPORT_ID` int NOT NULL AUTO_INCREMENT,
  `REPORT_TYPE` varchar(255) DEFAULT NULL,
  `TARGET_ID` varchar(255) NOT NULL,
  `USERID` varchar(255) NOT NULL,
  `REASON` text,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`REPORT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.report:~2 rows (대략적) 내보내기
INSERT INTO `report` (`REPORT_ID`, `REPORT_TYPE`, `TARGET_ID`, `USERID`, `REASON`, `REGDATE`) VALUES
	(1, 'FEED', 'user2', 'test', '부적절한 콘텐츠', '2025-05-14 06:10:23'),
	(2, 'FEED', 'user2', 'test', '혐오 발언', '2025-05-14 06:20:57');

-- 테이블 project.search_history 구조 내보내기
CREATE TABLE IF NOT EXISTS `search_history` (
  `SEARCH_ID` int NOT NULL AUTO_INCREMENT,
  `USERID` varchar(255) NOT NULL,
  `KEYWORD` varchar(255) NOT NULL,
  `TYPE` varchar(50) NOT NULL,
  `REGDATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SEARCH_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.search_history:~3 rows (대략적) 내보내기
INSERT INTO `search_history` (`SEARCH_ID`, `USERID`, `KEYWORD`, `TYPE`, `REGDATE`) VALUES
	(6, 'user1', '@test', 'account', '2025-05-18 14:00:21'),
	(7, 'user1', '@user1', 'account', '2025-05-18 14:54:49'),
	(8, 'user1', '@user10', 'account', '2025-05-18 14:54:59');

-- 테이블 project.withdrawn_users 구조 내보내기
CREATE TABLE IF NOT EXISTS `withdrawn_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `reason` text,
  `deleted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.withdrawn_users:~0 rows (대략적) 내보내기

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
