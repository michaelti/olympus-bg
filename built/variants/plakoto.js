"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
const game_1 = require("../game");
const ramda_1 = require("ramda");
const util_1 = require("../util");
class Plakoto extends game_1.Board {
    constructor() {
        super(...arguments);
        // Returns 2D array of Move objects
        this.allPossibleTurns = function () {
            if (this.dice.length === 0)
                return [];
            let allTurns = [];
            const uniqueDice = this.dice[0] === this.dice[1] ? [this.dice[0]] : this.dice;
            for (const die of uniqueDice) {
                for (let pipIndex = 1; pipIndex <= 24; pipIndex++) {
                    if (this.pips[pipIndex].top === this.turn) {
                        const currentMove = game_1.Move(pipIndex, game_1.clamp(this.turn * die + Number(pipIndex)));
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
        };
        // Is the board in a state where the game has just ended?
        // Returns the number of points won
        this.isGameOver = function () {
            const home = { [game_1.Player.white]: this.pips[1], [game_1.Player.black]: this.pips[24] };
            // Both player's starting checkers have been trapped: game is a draw
            if (this.pips[1].top !== this.pips[1].bot && this.pips[24].top !== this.pips[24].bot) {
                this.winner = game_1.Player.neither;
                this.turn = game_1.Player.neither;
                return 1;
            }
            // Player has borne off all of their checkers
            else if (this.off[this.turn] === 15) {
                this.winner = this.turn;
                this.turn = game_1.Player.neither;
                // if the other player has born off 0 checkers, return 2 points
                return this.off[this.otherPlayer(this.winner)] === 0 ? 2 : 1;
            }
            // If other player's starting checker has been pinned and current player's is safe
            else if (home[this.otherPlayer()].top !== home[this.otherPlayer()].bot &&
                home[this.turn].bot !== this.turn) {
                this.winner = this.turn;
                this.turn = game_1.Player.neither;
                return 2;
            }
            return 0;
        };
    }
    // Implement Plakoto-specific methods and variables
    // Initialize the board for a game of plakoto
    initGame() {
        this.pips[24] = game_1.Pip(15, game_1.Player.black); // Black moves towards pip 1 (decreasing)
        this.pips[1] = game_1.Pip(15, game_1.Player.white); // White moves towards pip 24 (increasing)
    }
    ;
    /** Is the move valid?
     * @param from Move from pip # <eg. 1>
     * @param to Move to pip # <eg. 4>
     */
    isMoveValid(from, to) {
        to = game_1.clamp(to);
        if (this.pips[from].top !== this.turn)
            return false;
        // Bearing off
        if (to === 25 || to === 0) {
            if (this.turn === game_1.Player.white && from < 19)
                return false;
            if (this.turn === game_1.Player.black && from > 6)
                return false;
            // Range of all pips excluding the current player's home quadrant
            const nonHomePips = this.turn === game_1.Player.white ? util_1.range(1, 18) : util_1.range(7, 24);
            for (const i of nonHomePips) {
                if (this.pips[i].top === this.turn || this.pips[i].bot === this.turn)
                    return false;
            }
            // If bearing off from an non-exact number of pips
            if (!this.dice.includes(game_1.pipDistance(from, to))) {
                // Check if there's a big enough dice
                if (this.dice[0] > game_1.pipDistance(from, to) || this.dice[1] > game_1.pipDistance(from, to)) {
                    // Range of pips in the player's home quadrant that are further away than the pip they are trying to bear off of
                    const farHomePips = this.turn === game_1.Player.white ? util_1.range(19, from - 1) : util_1.range(from + 1, 6);
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
            if (this.pips[to].top !== this.turn && this.pips[to].size > 1)
                return false;
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
        else if (this.pips[from].size === 2 && this.pips[from].top !== this.pips[from].bot) {
            this.pips[from].top = this.pips[from].bot;
        }
        this.pips[from].size--;
        // To pip
        if (to === 0 || to === 25) {
            // Bearing off
            if (this.turn === game_1.Player.white)
                this.off[game_1.Player.white]++;
            if (this.turn === game_1.Player.black)
                this.off[game_1.Player.black]++;
        }
        else {
            if (this.pips[to].size === 0) {
                this.pips[to].bot = this.turn;
            }
            this.pips[to].top = this.turn;
            this.pips[to].size++;
        }
        // Handle dice. NOTE: this will only work for 2 distinct values or 4 identical values
        if (this.dice[0] >= game_1.pipDistance(from, to))
            this.dice.shift();
        else
            this.dice.pop();
    }
    ;
}
exports.Board = Plakoto;
;
