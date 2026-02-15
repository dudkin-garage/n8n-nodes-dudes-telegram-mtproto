# n8n-nodes-dudes-telegram-mtproto

Minimal n8n community node for Telegram MTProto chat history retrieval using a user account.

## Features

- Get last N messages from a chat, group, or channel
- Accepts @username, numeric IDs, and invite links
- Returns basic media metadata
- Includes a session generator script

## Install (custom nodes folder)

1. Clone/build inside your custom nodes directory (e.g., `/home/node/.n8n/nodes`).
2. Install dependencies and build:

```bash
npm install
npm run build
```

3. Restart n8n.

## Generate Session String

```bash
npm run session:mtproto
```

Copy the `SESSION_STRING` output into the credentials.

## Credentials

- API ID
- API Hash
- Phone Number
- Session String (plain GramJS session)

## Node Usage

Resource: Message
Operation: Get Chat History

Parameters:
- Chat ID / Username / Invite Link
- Limit

## License

MIT
