import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class TelegramMtproto implements ICredentialType {
  name = 'telegramMtproto';
  displayName = 'Telegram MTProto';

  properties: INodeProperties[] = [
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
