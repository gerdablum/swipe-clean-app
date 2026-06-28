import { PhotoMetadata, PhotoStatus } from "../../../types/PhotoMetadata";
import PhotoMetadataDB from "./PhotoMetadataDB";
import { PersistenceInterface } from "../../PersistenceInterface";
import { database } from "./Database";
import { Q } from '@nozbe/watermelondb'

export class WatermelonDBImpl implements PersistenceInterface {

    async create(record: PhotoMetadata): Promise<boolean> {
        this.exists(record.uri).then((exists) => {
            if (exists) {
                console.info(`URI ${record.uri} already exists in the database. Use update instead of create.`);
                return false; // already exists, nothing to do
            }
        });
        await database.write(async () => {
            await database.get<PhotoMetadataDB>('photo_metadata').create((row) => {
            row.uri = record.uri;
            row.dateTime = record.dateTime;
            row.lat = record.lat;
            row.lon = record.lon;
            row.status = record.status;
            row.description = record.description;
            });
        });
        return true;
    }
    
    async createMany(records: PhotoMetadata[]): Promise<number> {
        // Remove duplicates from the input
        const uniqueUris = [...new Set(records.map(record => record.uri))];
        // Find which URIs already exist
        // TODO put this in a separate function as well?
        const existing = await database
        .get<PhotoMetadataDB>('photo_metadata')
        .query(Q.where('uri', Q.oneOf(uniqueUris)))
        .fetch();
    
        const existingUris = new Set(existing.map(record => record.uri));
        const newRecords = records.filter(record => !existingUris.has(record.uri));

        const operations = newRecords.map((record) =>
            database.get<PhotoMetadataDB>('photo_metadata').prepareCreate((row) => {
            row.uri = record.uri;
            row.dateTime = record.dateTime;
            row.lat = record.lat;
            row.lon = record.lon;
            row.status = record.status;
            row.description = record.description;
            }),
        );
        await database.write(async () => {
            await database.batch(operations);
        });

        return newRecords.length;
    }
    async read(uri: string): Promise<PhotoMetadata | null> {
        const matches = await database
        .get<PhotoMetadataDB>('photo_metadata')
        .query(Q.where('uri', uri))
        .fetch();

        if (matches.length === 0) {
            return null; // nothing to update
        }
        if (matches.length > 1) {
            console.warn(`Multiple records found for URI ${uri}. Returning the first one.`);
        }
        const record = matches[0];

        return {
            uri: record.uri,
            dateTime: record.dateTime,
            lat: record.lat,
            lon: record.lon,
            status: record.status,
            description: record.description,
        };
    }
    async update(uri: string, changes: Partial<PhotoMetadata>): Promise<boolean> {
        const record = await this.findRowByUri(uri);
        if (!record) {
            console.warn(`No record found for URI ${uri}. Use create instead of update.`);
            return false; // nothing to update
        }
        await database.write(async () => {
        await record.update((row) => {
            if (changes.dateTime !== undefined) row.dateTime = changes.dateTime;
            if (changes.lat !== undefined) row.lat = changes.lat;
            if (changes.lon !== undefined) row.lon = changes.lon;
            if (changes.status !== undefined) row.status = changes.status;
            if (changes.description !== undefined) row.description = changes.description;
        });
        });

        return true;
    }

    async delete(uri: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async deleteMany(uris: string[]): Promise<number> {
        const rows = await database
            .get<PhotoMetadataDB>('photo_metadata')
            .query(Q.where('uri', Q.oneOf(uris)))
            .fetch();

        if (rows.length === 0) {
            return 0;
        }

        const operations = rows.map((row) => row.prepareDestroyPermanently());

        await database.write(async () => {
            await database.batch(operations);
        });

        return rows.length;
    }

    async deleteAll(): Promise<boolean> {
        const allRows = await database.get<PhotoMetadataDB>('photo_metadata').query().fetch();

        const operations = allRows.map((row) => row.prepareDestroyPermanently());

        await database.write(async () => {
            await database.batch(operations); // pass the array directly, no spread
        });
            
        return true;
    }

    async exists(uri: string): Promise<boolean> {
        const existing = await this.findRowByUri(uri);
        if (existing) {
            return true;
        }
        return false;
    }
    async getByStatus(status: PhotoStatus): Promise<PhotoMetadata[]> {
        const rows = await database
            .get<PhotoMetadataDB>('photo_metadata')
            .query(Q.where('status', status))
            .fetch();

        return rows.map((row) => ({
            uri: row.uri,
            dateTime: row.dateTime,
            lat: row.lat,
            lon: row.lon,
            status: row.status,
            description: row.description,
        }));
    }
    
    getAll(): Promise<PhotoMetadata[]> {
        throw new Error("Method not implemented.");
    }

    private async findRowByUri(uri: string): Promise<PhotoMetadataDB | null> {
        const matches = await database
            .get<PhotoMetadataDB>('photo_metadata')
            .query(Q.where('uri', uri))
            .fetch();
        if (matches.length > 1) {
            console.warn(`Multiple records found for URI ${uri}. Returning the first one.`);
        }
        return matches.length > 0 ? matches[0] : null;
    }

}