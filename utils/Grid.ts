import { ModelValidateOptions } from "sequelize";

/**
 * The function create a player grid where all the ship will be placed randomly. Every cell has property hit and occupied.
 * @param size The size of the board structure to create.
 * @returns The board structure.
 */
 export function generateBoard(Boardsize: number): {x: number, y: number, hit: boolean, occupied: boolean}[] {
    const board: {x: number, y: number, hit: boolean, occupied: boolean}[] = [];
    for (let i = 0; i < Boardsize; i++) {
      for (let j = 0; j < Boardsize; j++) {
        board.push({x: i, y: j, hit: false, occupied: false});
      }
    }
    return board;
  }


// Chiedere correttezza poiché vertical sono calcolate in modo tale che occupano anche la cella della righa
 export function canPlaceShips(boardSize: number, ships: any): boolean {
    let occupiedCellsHorizontal = 0;
    let occupiedCellsVertical = 0;
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].size > boardSize){
        return false
      }
      occupiedCellsHorizontal += ships[i].size;
      occupiedCellsVertical += ships[i].size * boardSize;
    }
    return occupiedCellsHorizontal <= boardSize * boardSize || occupiedCellsVertical <= boardSize * boardSize;
  }

/**
 * The function place all the ships inside the board and return the final grid structure with board and ships.
 *  If a cell is already occupied or position exceeds board limit the function try new placement.
 * @param boardSize the size of the board structure.
 * @param board the board data structure.
 * @param ships the ship array [{size: number},...].
 * @returns a structure with both board data and ships list with their position.
 */
  export function placeShips(boardSize: number, board: any[], ships: any[]): {board: any[], placedShips: any[]} {
    const placedShips = [];
  
    for (const ship of ships) {
      let fits = false;
      while (!fits) {
        // Generate orientation 
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
  
        // Set a starting position
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        console.log("Coordinate generate");
        console.log(ship)
        console.log(orientation)
        console.log(x)
        console.log(y)
        console.log(board[y+x*boardSize])   
        // Check if the ship fits on the board and does not overlap with any existing ships
        fits = true;
        const positions = [];
        for (let i = 0; i < ship.size; i++) {
          if (orientation === "horizontal") {
            if (x + i >= boardSize || board[y+(x + i)*boardSize].occupied) { 
              fits = false;
              break;
            }
            positions.push({ x: x + i, y: y });
          } else {
            if (y + i >= boardSize || board[y+i+x*boardSize].occupied) { 
              fits = false;
              break;
            }
            positions.push({ x: x, y: y + i });
          }
        }
  
        // If the ship fits and does not overlap, add it to the board
        if (fits) {
          console.log("Nave posizionata")
          placedShips.push({ size: ship.size, positions });
          for (const position of positions) {
            board[position.y + position.x * boardSize].occupied = true;
          }
        }
      }
    }
    console.log(board)
  
    return { board, placedShips };
  }


/**
 * The function check if the given coordinates are valid in the game board.
 * @param boardSize The size of the board.
 * @param x Given x coordinate.
 * @param y Given y coordinate.
 * @returns boolean value 
 */
export function isValidAttack(boardSize: number, x: number, y: number): boolean {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
  }


  /**
   * The function check if all ship are being destroyed and the game is finished.
   * @param board the board data structure to check.
   * @returns a boolean representing if all ships are destroyed.
   */
  export function isGameFinished(board: any): boolean {
    for (const element of board) {
      if (element.occupied && !element.hit) {
        return false;
      }
    }
    return true;
  }


  /**
   * The function check if the attack is already have been done once. 
   * If it return false the client will get an error message.
   * @param x coordinate of the attack.
   * @param y coordinate of the attack.
   * @param board board structure of the considered player.
   * @returns boolean value.
   */
export function alreadyHit(x: number, y: number, board: any): boolean {
    for (let i = 0; i < board.length; i++) {
      if (board[i].x === x && board[i].y === y) {
        if (board[i].hit === true) {
          return true
        }
      }
    }
    return false
}

/**
 * 
 * @param x coordinate of the attack
 * @param y coordinate of the attack
 * @param board the board data structure
 * The function after an attack modify hit property of json object set in coordinate grid
 */
export function markHit(x: number, y: number, board:any): void {
  for (let i = 0; i < board.length; i++) {
    if (board[i].x === x && board[i].y === y) {
      board[i].hit = true;
    }
  }
}

/**
 * The function check if an attack hit an enemy ship.
 * @param x coordinate of the attack.
 * @param y coordinate of the attack.
 * @param board enemy player board structure.
 * @returns boolean value.
 */
export function checkShip(x: number, y: number, board: any): boolean {
  for (let i = 0; i < board.length; i++) {
    if (board[i].x === x && board[i].y === y) {
      if (board[i].occupied === true) {
        return true
      }
    }
  }
  return false
}


/** In case of silent mode after the game is finished all silent moves on history are replaced with real result.
 * @param moves array of all the moves of the game.
 * @returns modified moves array.
 */
export function ChangeSilentMoves(moves: any[]){
  console.log(moves)
  for(let i=0; i < moves.length; i++){
    if(moves[i].hashitted=="silence"){
      moves[i].hashitted=moves[i].raw;
    }
  }
  return moves;
}