CREATE DATABASE battleship;
\c battleship

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  creator varchar(40) NOT NULL,
  opponent varchar(40) DEFAULT NULL,
  game_type varchar(25) NOT NULL,
  silence_mode boolean DEFAULT 'false',
  state varchar(40) NOT NULL,
  winner varchar(40) NOT NULL,
  grid_size int NOT NULL
);


CREATE TABLE users (
  email varchar(40) NOT NULL,
  tokens float DEFAULT NULL,
  rule varchar(20) DEFAULT NULL,
  on_game boolean DEFAULT 'false',
  PRIMARY KEY (email)
);



INSERT INTO users (email, tokens, rule)
  VALUES 
  ('adrianomancini@mail.it',10,'user'),
  ('massimociaffoni@mail.it',10,'admin'),
  ('opponent@mail.it',10,'user');

