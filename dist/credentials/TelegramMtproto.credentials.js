"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramMtprotoCredentials = void 0;
class TelegramMtprotoCredentials {
    constructor() {
        this.name = 'telegramMtproto';
        this.displayName = 'Telegram MTProto';
        this.properties = [
            {
                displayName: 'API ID',
                name: 'apiId',
                type: 'number',
                default: '',
                required: true,
                description: 'Your Telegram API ID from https://my.telegram.org',
            },
            {
                displayName: 'API Hash',
                name: 'apiHash',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Your Telegram API Hash from https://my.telegram.org',
            },
            {
                displayName: 'Phone Number',
                name: 'phoneNumber',
                type: 'string',
                default: '',
                required: true,
                description: 'Phone number in international format (e.g., +1234567890)',
            },
            {
                displayName: 'Session String',
                name: 'sessionString',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Plain GramJS session string',
            },
        ];
    }
}
exports.TelegramMtprotoCredentials = TelegramMtprotoCredentials;
