drop table gametable;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `gametable` (
  `action` text DEFAULT NULL,
  `expected` text DEFAULT NULL,
  `fen` text DEFAULT NULL,
  `friendly` varchar(48) DEFAULT NULL,
  `game` varchar(24) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `modified` bigint(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `oldfen` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  `owner` varchar(24) DEFAULT NULL,
  `phase` varchar(24) DEFAULT NULL,
  `players` text DEFAULT NULL,
  `plorder` text DEFAULT NULL,
  `round` int DEFAULT 0,
  `stage` varchar(24) DEFAULT NULL,
  `status` text DEFAULT NULL,
  `step` int DEFAULT 0,
  `turn` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `friendly` (`friendly`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `gametable`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

