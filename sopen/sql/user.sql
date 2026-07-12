drop table user;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `motto` varchar(60) DEFAULT NULL,
  `data` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT INTO `user` (`id`,`name`,`color`,`motto`) VALUES 
(1,'afia','#69c963','the wise owl knows it!'), 
(2,'ally','#6660f3','no place like home'), 
(3,'amanda','#339940FF','let the world spin'), 
(4,'annabel','#ADA0EEFF','to be a unicorn'), 
(5,'bob','#033993',"let's play!"), 
(6,'buddy','midnightblue',"king of the jungle"), 
(7,'felix','BLUE','yin is my bad side, yang is my good side'), 
(8,'guest','dodgerblue','cafe landmann'), 
(9,'gul','#6fccc3',"let's play!"), 
(10,'lauren','BLUEGREEN',"time to play!"), 
(11,'leo','#C19450FF',"no place like home"), 
(12,'mac','ORANGE',"be what you are"), 
(13,'minnow','#F28DB2',"miau! miau!"), 
(14,'mimi','#76AEEBFF',"spi ma yu"), 
(15,'nasi','#EC4169FF',"bridge and golf"), 
(16,'nimble','#6E52CCFF',"one game at a time!"), 
(17,'sarah','deeppink',"wild and sweet"), 
(18,'sheeba','gold',"no place like home"), 
(19,'valerie','lightgreen',"time to play!");

ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

