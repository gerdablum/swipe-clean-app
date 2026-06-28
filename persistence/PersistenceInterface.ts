// src/persistence/PersistenceInterface.ts

import {PhotoMetadata, PhotoStatus} from '../types/PhotoMetadata';

export interface PersistenceInterface {
  /**
   * Creates a new photo metadata record
   * Returns false if a record with the same uri already exists.
   */
  create(record: PhotoMetadata): Promise<boolean>;


  /**
   * Creates multiple photo metadata records at once
   */
  createMany(records: PhotoMetadata[]): Promise<number>;

  /**
   * Fetches a single record by its uri.
   * Returns null if no record exists for that uri.
   */
  read(uri: string): Promise<PhotoMetadata | null>;

  /**
   * Updates an existing record by uri with the given partial fields.
   * Returns false if no record exists for that uri.
   */
  update(uri: string, changes: Partial<PhotoMetadata>): Promise<boolean>;

  /**
   * Deletes a record by uri.
   * Returns false if no record exists for that uri.
   */
  delete(uri: string): Promise<boolean>;

  /**
   * 
   * Deletes multiple records by their uris.
   */
  deleteMany(uris: string[]): Promise<number>;

  /**
   * Deletes all records in the table.
   */
  deleteAll(): Promise<boolean>;

  /**
   * Returns whether a record with this uri exists at all.
   */
  exists(uri: string): Promise<boolean>;

  /**
   * Returns all records matching a given status.
   */
  getByStatus(status: PhotoStatus): Promise<PhotoMetadata[]>;

  /**
   * Returns every record currently stored.
   */
  getAll(): Promise<PhotoMetadata[]>;
}