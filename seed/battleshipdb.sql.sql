CREATE DATABASE  IF NOT EXISTS `battleship` 
--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `email` varchar(40) NOT NULL,
  `tokens` double DEFAULT NULL,
  `rule` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`email`)
) 


--
-- Dumping data for table `users`
--

INSERT INTO `users` VALUES ('adrianomancini@mail.it',10,'user'),('massimociaffoni@mail.it',10,'admin'),('opponent@mail.it',10,'user');

