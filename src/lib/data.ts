
export type Message = {
  id: string;
  content: string;
  schedule: string;
  status: 'Active' | 'Scheduled' | 'Expired';
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  'data-ai-hint': string;
  storagePath: string; // File path used for deletion if stored locally
};

export type PhotoGroups = {
  [key: string]: Photo[];
};

export type Settings = {
  photoDuration: number;
  blankDuration: number;
  randomize: boolean;
  scrollSpeed: number;
  randomizeAllPhotos: boolean;
  randomizeInPhotoGroups: boolean;
  messageFontSize: number;
  displayPhotos: boolean;
  displayMessages: boolean;
  useBlankScreens: boolean;
  monitorActivity: boolean;
  photoDisplayMode: 'maxWidthCrop' | 'maxHeightCrop' | 'noCrop';
  morningStartHour: number;
  afternoonStartHour: number;
  eveningStartHour: number;
  nightStartHour: number;
};

export const defaultSettings: Settings = {
  photoDuration: 10,
  blankDuration: 3,
  randomize: false,
  scrollSpeed: 50,
  randomizeAllPhotos: false,
  randomizeInPhotoGroups: true,
  messageFontSize: 48,
  displayPhotos: true,
  displayMessages: true,
  useBlankScreens: true,
  monitorActivity: false,
  photoDisplayMode: 'maxWidthCrop',
  morningStartHour: 6,
  afternoonStartHour: 12,
  eveningStartHour: 18,
  nightStartHour: 22,
};
