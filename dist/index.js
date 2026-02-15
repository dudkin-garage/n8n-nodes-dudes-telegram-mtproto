"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.nodes = void 0;
const TelegramMtproto_node_1 = require("./nodes/TelegramMtproto.node");
const TelegramMtproto_credentials_1 = require("./credentials/TelegramMtproto.credentials");
exports.nodes = [TelegramMtproto_node_1.TelegramMtproto];
exports.credentials = [TelegramMtproto_credentials_1.TelegramMtprotoCredentials];
