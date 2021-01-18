"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDie = exports.Pip = exports.Board = exports.reverseMove = exports.Move = exports.pipDistance = exports.clamp = exports.Variant = exports.TurnMessage = exports.Player = void 0;
const random_js_1 = require("random-js");
const random = new random_js_1.Random(random_js_1.MersenneTwister19937.autoSeed());
// Enum-like object
var Player;
(function (Player) {
    Player[Player["neither"] = 0] = "neither";
    Player[Player["white"] = 1] = "white";
    Player[Player["black"] = -1] = "black";
})(Player = exports.Player || (exports.Player = {}));
;
var TurnMessage;
(function (TurnMessage) {
    TurnMessage[TurnMessage["valid"] = 1] = "valid";
    TurnMessage[TurnMessage["validZero"] = 2] = "validZero";
    TurnMessage[TurnMessage["invalid"] = 0] = "invalid";
    TurnMessage[TurnMessage["invalidMoreMoves"] = -1] = "invalidMoreMoves";
    TurnMessage[TurnMessage["invalidLongerMove"] = -2] = "invalidLongerMove";
})(TurnMessage = exports.TurnMessage || (exports.TurnMessage = {}));
;
// Variant of backgammon
var Variant;
(function (Variant) {
    Variant[Variant["portes"] = 1] = "portes";
    Variant[Variant["plakoto"] = 2] = "plakoto";
    Variant[Variant["fevga"] = 3] = "fevga";
})(Variant = exports.Variant || (exports.Variant = {}));
;
// Clamps "to" in range 0–25
const clamp = (to) => (to < 0 ? 0 : to > 25 ? 25 : to);
exports.clamp = clamp;
// Returns the distance between two pips (1–6)
function pipDistance(from, to) {
    const dist = Math.abs(to - from);
    return dist <= 6 ? dist : 24 - dist;
}
exports.pipDistance = pipDistance;
;
const Move = (from, to) => ({ from, to });
exports.Move = Move;
const reverseMove = (move) => ({ from: move.to, to: move.from });
exports.reverseMove = reverseMove;
class Board {
    constructor() {
        this.turn = null;
        this.winner = null;
        this.off = { [Player.white]: 0, [Player.black]: 0 };
        this.pips = new Array(26).fill(null).map(() => exports.Pip());
        this.diceRolled = new Array(2);
        this.dice = new Array(2);
        this.recentMove = {};
        this.possibleTurns = null;
        this.maxTurnLength = 0;
        this.turnValidity = TurnMessage.invalid;
    }
    publicProperties() {
        return {
            turn: this.turn,
            winner: this.winner,
            off: this.off,
            pips: this.pips,
            diceRolled: this.diceRolled,
            dice: this.dice,
            recentMove: this.recentMove,
            turnValidity: this.turnValidity,
        };
    }
    ;
    rollDice() {
        // Roll a 6-sided die, 2 times
        this.diceRolled = random.dice(6, 2);
        // Doubles
        if (this.diceRolled[0] === this.diceRolled[1])
            this.diceRolled = this.diceRolled.concat(this.diceRolled);
        // Sort smallest to largest
        this.dice = [...this.diceRolled].sort((a, b) => a - b);
        this.maxTurnLength = 0;
        this.turnValidity = TurnMessage.invalid;
        try {
            this.possibleTurns = this.allPossibleTurns();
            for (const turn of this.possibleTurns) {
                if (turn.length > this.maxTurnLength)
                    this.maxTurnLength = turn.length;
            }
            if (this.maxTurnLength === 0)
                this.turnValidity = TurnMessage.validZero;
        }
        catch (four) {
            // Code optimization when there's a possible 4-move turn
            this.maxTurnLength = 4;
        }
    }
    ;
    // Returns the player who's turn it ISN'T
    otherPlayer(player = this.turn) {
        if (player === Player.black)
            return Player.white;
        if (player === Player.white)
            return Player.black;
        return Player.neither;
    }
    ;
    // Is the board in a state where either player has won?
    // Returns the number of points won
    isGameOver() {
        if (this.off[this.turn] === 15) {
            this.winner = this.turn;
            this.turn = Player.neither;
            // if the other player has born off 0 checkers, return 2 points
            return this.off[this.otherPlayer(this.winner)] === 0 ? 2 : 1;
        }
        return 0;
    }
    ;
    // Validates a turn of 0–4 moves
    turnValidator(moves) {
        // Validate turn length. Players must make as many moves as possible
        if (this.maxTurnLength !== moves.length) {
            // unless they have 14 checkers off and are bearing off their 15th (final)
            if (!(this.off[this.turn] === 14 && (moves[0].to === 0 || moves[0].to === 25)))
                return TurnMessage.invalidMoreMoves;
        }
        // Validate single move turn uses the largest dice value possible
        if (this.maxTurnLength === 1 && this.dice.length === 2) {
            // if the supplied move matches the smaller dice
            // then check if there's a possible move with the larger dice
            if (pipDistance(moves[0].from, moves[0].to) === this.dice[0]) {
                for (const turn of this.possibleTurns) {
                    if (pipDistance(turn[0].from, turn[0].to) === this.dice[1])
                        return TurnMessage.invalidLongerMove;
                }
            }
        }
        return TurnMessage.valid;
    }
    ;
    // Dummy function, must be implemented by each backgammon variant
    allPossibleTurns() { return null; }
    ;
}
exports.Board = Board;
;
const Pip = (size = 0, owner = Player.neither) => ({
    size: size,
    top: owner,
    bot: owner,
});
exports.Pip = Pip;
const rollDie = () => random.die(6);
exports.rollDie = rollDie;
