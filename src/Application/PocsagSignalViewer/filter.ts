import { RawPocsagRow } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';

export interface FilterParams {
  content?: string;
  address?: string;
  type?: MessageType | null;
  timestamp?: string;
}

export const filterPocsagData = (
  data: RawPocsagRow[],
  { content = '', address = '', type = null, timestamp = '' }: FilterParams
): RawPocsagRow[] => {
  return data.filter(
    (record) =>
      record.message_content.toLowerCase().includes(content.toLowerCase()) &&
      record.address.toLowerCase().includes(address.toLowerCase()) &&
      (type === null || record.message_format === type) &&
      record.timestamp.toLowerCase().includes(timestamp.toLowerCase())
  );
};
