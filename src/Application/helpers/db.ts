import { version } from '../trainsDbCfg';
import { getAllRecordsAsync, openAsync } from './indexedDBHelpers';

/**
 * Get all records from a table
 */
export const getTableRecordsAsync = async (
  dbName: string,
  tableName: string
) => {
  const db = await openAsync(dbName, version);

  if (!db.objectStoreNames.contains(tableName)) {
    throw new Error(`Table does not exist in database: ${dbName}/${tableName}`);
  }

  const records = await getAllRecordsAsync(db, tableName);
  return records;
};
