"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
const game_1 = require("../game");
const ramda_clone_1 = require("ramda.clone");
const util_1 = require("../util");
class Portes extends game_1.Board {
    constructor() {
        super(...arguments);
        // Implement Portes-specific methods and variables
        this.bar = { [game_1.Player.white]: this.pips[0], [game_1.Player.black]: this.pips[25] };
    }
    // Initialize the board for a game of portes
    initGame() {
        this.pips[25] = game_1.Pip(0, game_1.Player.black);
        this.pips[24] = game_1.Pip(2, game_1.Player.black); // Black moves towards pip 1 (decreasing)
        this.pips[19] = game_1.Pip(15, game_1.Player.white);
        this.pips[17] = game_1.Pip(3, game_1.Player.white);
        this.pips[13] = game_1.Pip(5, game_1.Player.black);
        this.pips[12] = game_1.Pip(5, game_1.Player.white);
        this.pips[8] = game_1.Pip(3, game_1.Player.black);
        this.pips[6] = game_1.Pip(5, game_1.Player.black);
        this.pips[1] = game_1.Pip(2, game_1.Player.white); // White moves towards pip 24 (increasing)
        this.pips[0] = game_1.Pip(0, game_1.Player.white);
        // Aliases so we can access the bar using a Player as the key
        //this.bar[Player.black] = this.pips[25];
        //this.bar[Player.white] = this.pips[0];
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
        // Entering the board
        if (this.bar[this.turn].size > 0) {
            if (from !== 25 && from !== 0)
                return false;
            if (this.pips[to].top !== this.turn && this.pips[to].size > 1)
                return false;
            if (!this.dice.includes(game_1.pipDistance(from, to)))
                return false;
        }
        // Bearing off
        else if (to === 25 || to === 0) {
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
        if (this.bar[this.turn].size > 0) {
            // Don't change owner of the bar ever
        }
        else if (this.pips[from].size === 1) {
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
            // Sending opponent to the bar
            if (this.pips[to].bot === this.otherPlayer()) {
                this.bar[this.otherPlayer()].size++;
                if (this.turn === game_1.Player.white)
                    this.recentMove.subMove = game_1.Move(to, 25);
                if (this.turn === game_1.Player.black)
                    this.recentMove.subMove = game_1.Move(to, 0);
            }
            else {
                this.pips[to].size++;
            }
            this.pips[to].top = this.turn;
            this.pips[to].bot = this.turn;
        }
        // Handle dice. NOTE: this will only work for 2 distinct values or 4 identical values
        if (this.dice[0] >= game_1.pipDistance(from, to))
            this.dice.shift();
        else
            this.dice.pop();
    }
    ;
    // Returns 2D array of Move objects
    allPossibleTurns() {
        if (this.dice.length === 0)
            return [];
        let allTurns = [];
        const uniqueDice = this.dice[0] === this.dice[1] ? [this.dice[0]] : this.dice;
        for (const die of uniqueDice) {
            for (let pipIndex = 0; pipIndex <= 25; pipIndex++) {
                if (this.pips[pipIndex].top === this.turn) {
                    const currentMove = game_1.Move(pipIndex, game_1.clamp(this.turn * die + pipIndex));
                    if (this.isMoveValid(currentMove.from, currentMove.to)) {
                        // deep copy game board using ramda
                        let newBoard = ramda_clone_1.default(this);
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
exports.Board = Portes;
;
