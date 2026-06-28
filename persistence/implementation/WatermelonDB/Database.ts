// model/database.ts
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {mySchema} from './Schema';
import PhotoMetadata from './PhotoMetadataDB';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  jsi: false,
  onSetUpError: (error) => {
    console.error('Database failed to load:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [PhotoMetadata],
});