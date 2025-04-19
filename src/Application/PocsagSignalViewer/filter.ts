import { ParsedPocsagRow } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';

export interface FilterParams {
  content?: string;
  address?: string;
  type?: MessageType | null;
  timestamp?: string;
}

export const filterPocsagData = (
  data: ParsedPocsagRow[],
  { content = '', address = '', type = null, timestamp = '' }: FilterParams
): ParsedPocsagRow[] => {
  return data.filter(
    (record) =>
      record.rawSignal['message_content(string)']
        .toLowerCase()
        .includes(content.toLowerCase()) &&
      record.rawSignal['address(string)'].includes(address) &&
      (type === null || record.messageFormat === type) &&
      record.timestamp.toLowerCase().includes(timestamp.toLowerCase())
  );
};
