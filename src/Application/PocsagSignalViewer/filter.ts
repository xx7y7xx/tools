import { PocsagData } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';

export interface FilterParams {
  content?: string;
  address?: string;
  type?: MessageType | null;
  timestamp?: string;
}

export const filterPocsagData = (
  data: PocsagData[],
  { content = '', address = '', type = null, timestamp = '' }: FilterParams
): PocsagData[] => {
  return data.filter(
    (record) =>
      record.message_content.toLowerCase().includes(content.toLowerCase()) &&
      record.address.toLowerCase().includes(address.toLowerCase()) &&
      (type === null || record.message_format === type) &&
      record.timestamp.toLowerCase().includes(timestamp.toLowerCase())
  );
};
