// model/PhotoMetadata.ts
import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export type PhotoStatus = 'kept' | 'deleted' ;

export default class PhotoMetadataDB extends Model {
  static table = 'photo_metadata';

  @text('uri') uri!: string;
  @field('date_time') dateTime!: string | null;
  @field('lat') lat!: number | null;
  @field('lon') lon!: number | null;
  @text('status') status!: PhotoStatus;
  @text('description') description!: string | null;
}