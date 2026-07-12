drop table indiv;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `indiv` (
  `id` int(11) DEFAULT NULL,
  `friendly` varchar(50) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `player_status` varchar(8) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `state` text DEFAULT NULL,
  `state1` text DEFAULT NULL,
  `state2` text DEFAULT NULL,
  `checked` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `indiv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `friendly` (`friendly`),
  ADD KEY `name` (`name`),
  ADD KEY `score` (`score`),
  ADD KEY `checked` (`checked`),
  ADD KEY `player_status` (`player_status`);

ALTER TABLE `indiv`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;


