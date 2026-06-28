
export type PhotoStatus = 'kept' | 'deleted';

export type PhotoMetadata = {
  uri: string;
  dateTime: string | null;
  lat: number | null;
  lon: number | null;
  status: PhotoStatus;
  description: string | null;
};