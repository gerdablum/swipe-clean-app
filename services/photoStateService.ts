import {PersistenceInterface} from '../persistence/PersistenceInterface';
import {PhotoMetadata, PhotoStatus} from '../types/PhotoMetadata';

export class PhotoStateService {
  constructor(private persistence: PersistenceInterface) {}

  async saveUri(uri: string, dateTime: string, lat: number | null = null, lon: number | null =null, status: PhotoStatus): Promise<boolean> {
    const newEntry: PhotoMetadata = {
      uri,
      dateTime,
      lat,
      lon,
      status,
      description: null,
    };
    try {
      const success = await this.persistence.create(newEntry);
      return success;
    }
    catch (error) {
      console.error(`Failed to save URI ${uri}:`, error);
      return false;
    }
  }

  async deleteAll(): Promise<boolean> {
    try {
      await this.persistence.deleteAll();
      return true;
    } catch (error) {
      console.error(`Failed to delete all records:`, error);  
      return false;
    }
  }

  async getUnseenUris(allPhotos: string[]): Promise<string[]> {

    const seenPhotos = await this.getOnlyKept();
    const seenUris = new Set(seenPhotos.map(photo => photo.uri));
    const unseenUris = allPhotos.filter(uri => !seenUris.has(uri));
    return unseenUris;
  }

  async getOnlyKept(): Promise<PhotoMetadata[]> {
    try {
      const records = await this.persistence.getByStatus('kept');
      return records;
    } catch (error) {
      console.error(`Failed to get records by status pending:`, error);
      return [];
    }
  }
}