CREATE DATABASE battleship;
\c battleship

CREATE TABLE users (
  email varchar(40) NOT NULL,
  tokens int DEFAULT NULL,
  rule varchar(20) DEFAULT NULL,
  PRIMARY KEY (email)
);



INSERT INTO users (email, tokens, rule)
  VALUES 
  ('adrianomancini@mail.it',10,'user'),
  ('massimociaffoni@mail.it',10,'admin'),
  ('opponent@mail.it',10,'user');

