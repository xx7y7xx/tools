import { ParsedPocsagRow } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';

export interface FilterParams {
  content?: string;
  address?: string;
  type?: MessageType | null;
  types?: MessageType[] | null;
  timestamp?: string;
}

export const filterPocsagData = (
  data: ParsedPocsagRow[],
  {
    content = '',
    address = '',
    type = null,
    types = null,
    timestamp = '',
  }: FilterParams
): ParsedPocsagRow[] => {
  return data.filter(
    (record) =>
      record.rawSignal['message_content(string)']
        .toLowerCase()
        .includes(content.toLowerCase()) &&
      record.rawSignal['address(string)'].includes(address) &&
      ((type === null && types === null) ||
        (type !== null && record.messageFormat === type) ||
        (types !== null && types.includes(record.messageFormat))) &&
      record.timestamp.toLowerCase().includes(timestamp.toLowerCase())
  );
};
