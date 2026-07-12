drop table gametable;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `gametable` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `friendly` varchar(48) DEFAULT NULL,
  `game` varchar(24) DEFAULT NULL,
  `host` varchar(24) DEFAULT NULL,
  `players` text DEFAULT NULL,
  `phase` varchar(24) DEFAULT NULL,
  `step` int DEFAULT 0,
  `round` int DEFAULT 0,
  `stage` varchar(24) DEFAULT NULL,
  `fen` text DEFAULT NULL,
  `expected` text DEFAULT NULL,
  `action` text DEFAULT NULL,
  `options` text DEFAULT NULL,
  `scoring` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `modified` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `friendly` (`friendly`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `gametable`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

