import dgram from 'dgram';
import { EventEmitter } from 'events';
import { Pocsag1234002Data } from './types';

export class UDPBridge extends EventEmitter {
  private server: dgram.Socket;
  private port: number;
  private host: string;

  constructor(port: number = 9999, host: string = '0.0.0.0') {
    super();
    this.port = port;
    this.host = host;
    this.server = dgram.createSocket('udp4');
  }

  start(): void {
    this.server.bind(this.port, this.host);

    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`UDP Bridge listening on ${address.address}:${address.port}`);
    });

    this.server.on('message', (msg, remoteInfo) => {
      try {
        // Import the decode function from your existing UDP server
        const {
          decodeAddress,
        } = require('../../../sdr_pocsag/train_utils/train_utils');
        const address = decodeAddress(msg);

        if (address === '1234002') {
          console.log(
            `[UDP Bridge] Received POCSAG 1234002 message from ${remoteInfo.address}:${remoteInfo.port}`
          );

          // Parse the POCSAG 1234002 data
          const pocsagData = this.parsePocsag1234002(msg);
          if (pocsagData) {
            // Emit the parsed data for the WebSocket server to handle
            this.emit('pocsag1234002', pocsagData);
          }
        }
      } catch (error) {
        console.error('[UDP Bridge] Error processing message:', error);
      }
    });

    this.server.on('error', (error) => {
      console.error('[UDP Bridge] UDP server error:', error);
    });
  }

  private parsePocsag1234002(msg: Buffer): Pocsag1234002Data | null {
    try {
      // Import the parsing functions from your existing UDP server
      const {
        decode,
        splitBufferBy,
        decodeDateTime,
      } = require('../../../sdr_pocsag/train_utils/train_utils');
      const {
        parsePocsag1234002,
      } = require('../../../sdr_pocsag/multimon_parser/train_parser');

      // Decode the message
      const msgParts = splitBufferBy(msg, 0x00);
      const pocsag1234002Msg = decode(msgParts[5], 0, msgParts[5].length);
      const dateTime = decodeDateTime(msg);

      // Parse the POCSAG 1234002 message
      const parsedPocsag1234002 = parsePocsag1234002(pocsag1234002Msg);

      if (parsedPocsag1234002.err || !parsedPocsag1234002.data) {
        console.error(
          '[UDP Bridge] Failed to parse POCSAG 1234002:',
          parsedPocsag1234002.err
        );
        return null;
      }

      const data = parsedPocsag1234002.data;
      if (!data.wgs84 || !data.gcj02) {
        console.error('[UDP Bridge] Missing coordinate data');
        return null;
      }

      return {
        DateTime: dateTime,
        pocsag1234002Msg,
        wgs84Str: data.wgs84Str || '',
        wgs84_latitude: data.wgs84.latitude,
        wgs84_longitude: data.wgs84.longitude,
        gcj02_latitude: data.gcj02.latitude,
        gcj02_longitude: data.gcj02.longitude,
      };
    } catch (error) {
      console.error('[UDP Bridge] Error parsing POCSAG 1234002:', error);
      return null;
    }
  }

  stop(): void {
    this.server.close();
    console.log('[UDP Bridge] UDP server stopped');
  }
}
