const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

(async () => {
  const apiIdInput = await input.text("API ID: ");
  const apiId = parseInt(apiIdInput, 10);
  const apiHash = await input.password("API HASH: ");
  const phoneNumber = await input.text("Phone number: ");

  if (!apiId || !apiHash || !phoneNumber) {
    console.error("API ID, API HASH, and phone number are required.");
    process.exit(1);
  }

  const stringSession = new StringSession("");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => phoneNumber,
    password: async () => await input.password("2FA password (if any): "),
    phoneCode: async () => await input.text("Code from Telegram: "),
    onError: (err) => console.error(err),
  });

  console.log("SESSION_STRING:", client.session.save());

  await client.disconnect();
  await client.destroy();
})();
