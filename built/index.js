"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fevga = exports.plakoto = exports.portes = exports.rollDie = exports.reverseMove = exports.Board = exports.Player = exports.Variant = void 0;
const game_1 = require("./game");
Object.defineProperty(exports, "Variant", { enumerable: true, get: function () { return game_1.Variant; } });
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return game_1.Player; } });
Object.defineProperty(exports, "Board", { enumerable: true, get: function () { return game_1.Board; } });
Object.defineProperty(exports, "reverseMove", { enumerable: true, get: function () { return game_1.reverseMove; } });
Object.defineProperty(exports, "rollDie", { enumerable: true, get: function () { return game_1.rollDie; } });
const portes = require("./variants/portes");
exports.portes = portes;
const plakoto = require("./variants/plakoto");
exports.plakoto = plakoto;
const fevga = require("./variants/fevga");
exports.fevga = fevga;
