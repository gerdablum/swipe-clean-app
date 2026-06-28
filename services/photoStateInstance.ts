
import {WatermelonDBImpl} from '../persistence/implementation/WatermelonDB/WatermelonDBImpl.ts';
import {PhotoStateService} from './photoStateService.ts';

export const photoStateService = new PhotoStateService(new WatermelonDBImpl());