import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

type MediaInfo = {
  type: string;
  mimeType?: string;
  size?: number | string;
  fileName?: string;
};

const INVITE_PREFIXES = [
  't.me/+',
  'https://t.me/+',
  'http://t.me/+',
  't.me/joinchat/',
  'https://t.me/joinchat/',
  'http://t.me/joinchat/',
];

const LINK_PREFIXES = [
  't.me/',
  'https://t.me/',
  'http://t.me/',
];

function extractInviteHash(raw: string): string | null {
  const trimmed = raw.trim();
  for (const prefix of INVITE_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

function normalizeChatId(raw: string): string {
  const trimmed = raw.trim();
  for (const prefix of LINK_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return trimmed;
}

function getMediaInfo(message: any): MediaInfo | undefined {
  if (!message || !message.media) {
    return undefined;
  }

  if (message.media instanceof Api.MessageMediaPhoto) {
    return { type: 'photo' };
  }

  if (message.media instanceof Api.MessageMediaDocument) {
    const document = message.media.document as Api.Document;
    let fileName: string | undefined;
    if (document && Array.isArray(document.attributes)) {
      for (const attr of document.attributes) {
        if (attr instanceof Api.DocumentAttributeFilename) {
          fileName = attr.fileName;
          break;
        }
      }
    }

    return {
      type: 'document',
      mimeType: document?.mimeType,
      size: normalizeId(document?.size),
      fileName,
    };
  }

  return { type: 'unknown' };
}

function normalizeId(value: any): string | number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value.toString === 'function') return value.toString();
  return undefined;
}

function getSenderId(message: any): string | number | undefined {
  if (!message || !message.fromId) {
    return undefined;
  }

  if (message.fromId.userId) return normalizeId(message.fromId.userId);
  if (message.fromId.channelId) return normalizeId(message.fromId.channelId);
  if (message.fromId.chatId) return normalizeId(message.fromId.chatId);
  return undefined;
}

export class TelegramMtproto implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Telegram MTProto',
    name: 'telegramMtproto',
    icon: 'file:telegram.svg',
    group: ['transform'],
    version: 1,
    description: 'Get Telegram chat history via MTProto',
    defaults: {
      name: 'Telegram MTProto',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'telegramMtproto',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Message', value: 'message' },
        ],
        default: 'message',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['message'],
          },
        },
        options: [
          { name: 'Get Chat History', value: 'getHistory', action: 'Get Chat History' },
        ],
        default: 'getHistory',
      },
      {
        displayName: 'Chat ID / Username / Invite Link',
        name: 'chatId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getHistory'],
          },
        },
        description: 'Accepts @username, numeric ID, or invite link',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        required: true,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getHistory'],
          },
        },
        description: 'Number of most recent messages to return',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      if (resource !== 'message' || operation !== 'getHistory') {
        throw new NodeOperationError(this.getNode(), 'Unsupported operation', { itemIndex: i });
      }

      const chatIdInput = this.getNodeParameter('chatId', i) as string;
      const limit = this.getNodeParameter('limit', i) as number;

      const credentials = await this.getCredentials('telegramMtproto');
      const apiId = credentials.apiId as number;
      const apiHash = credentials.apiHash as string;
      const sessionString = credentials.sessionString as string;

      const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 3,
      });

      try {
        await client.connect();

        const inviteHash = extractInviteHash(chatIdInput);
        let entity: any;

        if (inviteHash) {
          const result = await client.invoke(
            new Api.messages.ImportChatInvite({ hash: inviteHash })
          );

          if (!result || !('chats' in result) || result.chats.length === 0) {
            throw new Error('Invite link resolved but no chat was returned');
          }

          entity = result.chats[0];
        } else {
          const normalized = normalizeChatId(chatIdInput);
          entity = await client.getEntity(normalized);
        }

        const messages = await client.getMessages(entity, { limit });

        for (const message of messages) {
          const rawDate = message.date as unknown;
          let dateIso: string | undefined;
          if (rawDate instanceof Date) {
            dateIso = rawDate.toISOString();
          } else if (typeof rawDate === 'number') {
            dateIso = new Date(rawDate * 1000).toISOString();
          }

          returnData.push({
            json: {
              id: message.id,
              date: dateIso,
              text: message.message || '',
              senderId: getSenderId(message),
              chatId: chatIdInput,
              media: getMediaInfo(message),
            },
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      } finally {
        try {
          await client.disconnect();
          await client.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    return [returnData];
  }
}
