// model/schema.ts
import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'photo_metadata',
      columns: [
        {name: 'uri', type: 'string', isIndexed: true},
        {name: 'date_time', type: 'string'},
        {name: 'lat', type: 'number', isOptional: true},
        {name: 'lon', type: 'number', isOptional: true},
        {name: 'status', type: 'string', isIndexed: true}, // 'kept' | 'deleted' | 'pending'
        {name: 'description', type: 'string'},
      ],
    }),
  ],
});