CREATE DATABASE battleship;
\c battleship

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  creator json  NOT NULL DEFAULT '{}',
  opponent json NOT NULL DEFAULT '{}',
  game_type varchar(25) NOT NULL,
  silent_mode boolean DEFAULT 'false',
  creator_silent int,
  opponent_silent int,
  state varchar(40) NOT NULL DEFAULT 'Closed',
  turn varchar(40) NOT NULL DEFAULT 'Not Setted',
  winner varchar(40) NOT NULL DEFAULT 'Game not finished',
  grid_size int NOT NULL,
  creator_grid json NOT NULL DEFAULT '{}',
  opponent_grid json NOT NULL DEFAULT '{}',
  moves JSON[][]
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
  ('opponent@mail.it',10,'user'),
  ('usernotokens@mail.it',0.34,'user'),
  ('AI',10000,'ai');



