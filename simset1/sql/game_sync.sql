
CREATE TABLE `game_sync` (
  `game_id` int(11) NOT NULL,
  `player_id` varchar(50) NOT NULL,
  `has_moved` tinyint(1) DEFAULT 0,
  `move_data` text DEFAULT NULL,
  PRIMARY KEY (`game_id`, `player_id`)
);
