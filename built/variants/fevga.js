"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
const game_1 = require("../game");
const ramda_1 = require("ramda");
const util_1 = require("../util");
var State;
(function (State) {
    State[State["start"] = 1] = "start";
    State[State["firstAway"] = 2] = "firstAway";
    State[State["default"] = 3] = "default";
})(State || (State = {}));
;
class Fevga extends game_1.Board {
    constructor() {
        super(...arguments);
        // Implement Fevga-specific methods and variables
        this.state = { [game_1.Player.white]: State.start, [game_1.Player.black]: State.start };
    }
    // Initialize the board for a game of fevga
    initGame() {
        this.pips[24] = game_1.Pip(15, game_1.Player.black); // Black moves towards pip 1 (decreasing)
        this.pips[12] = game_1.Pip(15, game_1.Player.white); // White moves towards pip 13 (decreasing)
    }
    ;
    // Is the move valid?
    // from:    Move from pip # <eg. 1>
    // to:      Move to pip # <eg. 4>
    // return:  Returns a boolean
    isMoveValid(from, to) {
        to = game_1.clamp(to);
        if (this.pips[from].top !== this.turn)
            return false;
        // You can't move from your big pile until you move past the other player's big pile
        if (this.state[this.turn] === State.firstAway) {
            if (from === 12 || from === 24)
                return false;
        }
        // Bearing off
        if (to === 25 || to === 0) {
            if (to === 25)
                to = 12;
            if (this.turn === game_1.Player.white && (from > 18 || from < 13))
                return false;
            if (this.turn === game_1.Player.black && from > 6)
                return false;
            // Range of all pips excluding the current player's home quadrant
            const nonHomePips = this.turn === game_1.Player.white ? util_1.range(18, 35) : util_1.range(6, 23); // 1–12, 19–24 : 7–24
            for (const i of nonHomePips) {
                if (this.pips[(i % 24) + 1].top === this.turn)
                    return false;
            }
            // If bearing off from an non-exact number of pips
            if (!this.dice.includes(game_1.pipDistance(from, to))) {
                // Check if there's a big enough dice
                if (this.dice[0] > game_1.pipDistance(from, to) || this.dice[1] > game_1.pipDistance(from, to)) {
                    // Range of pips in the player's home quadrant that are further away than the pip they are trying to bear off of
                    const farHomePips = this.turn === game_1.Player.white ? util_1.range(from + 1, 18) : util_1.range(from + 1, 6);
                    for (const i of farHomePips) {
                        if (this.pips[i].top === this.turn || this.pips[i].bot === this.turn)
                            return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        // Standard move
        else {
            if (from < 1 || from > 24 || to < 1 || to > 24)
                return false;
            if (this.pips[to].top !== this.turn && this.pips[to].size > 0)
                return false;
            if (this.turn === game_1.Player.white && from >= 13 && to <= 12)
                return false;
            if (this.turn === game_1.Player.black && from <= 12 && to >= 13)
                return false;
            // Don't allow player to block all home pips
            const homePips = this.turn === game_1.Player.white ? util_1.range(7, 12) : util_1.range(19, 24);
            const pipBackup = this.pips[to].top;
            this.pips[to].top = this.turn; // See what would happen IF the player were to move there
            let owned = 0;
            for (const i of homePips)
                if (this.pips[i].top === this.turn)
                    owned++;
            this.pips[to].top = pipBackup; // Restore original board state
            if (owned >= 6 && this.pips[from].size > 1)
                return false;
            // Make sure one of your dice is the number of spaces you want to move
            if (!this.dice.includes(game_1.pipDistance(from, to)))
                return false;
        }
        return true;
    }
    ;
    doMove(from, to) {
        to = game_1.clamp(to);
        this.recentMove = game_1.Move(from, to);
        // From pip
        if (this.pips[from].size === 1) {
            this.pips[from].top = game_1.Player.neither;
            this.pips[from].bot = game_1.Player.neither;
        }
        this.pips[from].size--;
        // To pip
        if (to === 0 || to === 25) {
            // Bearing off
            this.off[this.turn]++;
            if (to === 25)
                to = 12;
        }
        else {
            if (this.pips[to].size === 0) {
                this.pips[to].top = this.turn;
                this.pips[to].bot = this.turn;
            }
            this.pips[to].size++;
        }
        // Handle dice. NOTE: this will only work for 2 distinct values or 4 identical values
        if (this.dice[0] >= game_1.pipDistance(from, to))
            this.dice.shift();
        else
            this.dice.pop();
        // Handle game state
        if (this.state[this.turn] === State.start)
            this.state[this.turn]++;
        else if (this.state[this.turn] === State.firstAway) {
            if ((this.turn === game_1.Player.white && to > 12) ||
                (this.turn === game_1.Player.black && to < 13)) {
                this.state[this.turn]++;
            }
        }
    }
    ;
    // Returns 2D array of Move objects
    allPossibleTurns() {
        if (this.dice.length === 0)
            return [];
        let allTurns = [];
        const uniqueDice = this.dice[0] === this.dice[1] ? [this.dice[0]] : this.dice;
        for (const die of uniqueDice) {
            for (let pipIndex = 1; pipIndex <= 24; pipIndex++) {
                if (this.pips[pipIndex].top === this.turn) {
                    let temp = pipIndex - die;
                    if (this.turn === game_1.Player.white) {
                        if (pipIndex >= 13 && temp <= 12)
                            temp = 25;
                        if (temp < 1)
                            temp += 24;
                    }
                    const currentMove = game_1.Move(pipIndex, game_1.clamp(temp));
                    if (this.isMoveValid(currentMove.from, currentMove.to)) {
                        // deep copy game board using ramda
                        let newBoard = ramda_1.clone(this);
                        newBoard.doMove(currentMove.from, currentMove.to);
                        const nextTurns = newBoard.allPossibleTurns();
                        if (nextTurns.length) {
                            for (const nextMoves of nextTurns) {
                                allTurns.push([currentMove, ...nextMoves]);
                                if ([currentMove, ...nextMoves].length === 4)
                                    throw "Possible turn of length 4 detected";
                            }
                        }
                        else {
                            allTurns.push([currentMove]);
                        }
                    }
                }
            }
        }
        return allTurns;
    }
    ;
}
exports.Board = Fevga;
;
