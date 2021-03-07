const { Variant, Player, random, reverseMove, rollDie } = require("./util");
const { Board } = require("./game");

exports.Variant = Variant;
exports.Player = Player;
exports.Board = Board;
exports.random = random;
exports.reverseMove = reverseMove;
exports.rollDie = rollDie;

exports.portes = require("./variants/portes");
exports.plakoto = require("./variants/plakoto");
exports.fevga = require("./variants/fevga");
