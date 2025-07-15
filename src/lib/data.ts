
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
  enabledPhotoCategories: string[];
  messageFontSize: number;
  displayPhotos: boolean;
  displayMessages: boolean;
  useBlankScreens: boolean;
  monitorActivity: boolean;
  photoDisplayMode: 'maxWidthCrop' | 'maxHeightCrop' | 'noCrop';
  photoZoomCurve:
    | 'none'
    | 'linear'
    | 'cubic'
    | 'sigmoid'
    | 'quadratic'
    | 'exponential'
    | 'logarithmic';
  photoZoomCurveMultiplier: number;
  morningStartHour: number;
  afternoonStartHour: number;
  eveningStartHour: number;
  nightStartHour: number;
  theme: 'light' | 'dark';
  cyclePhotosCount: number; // N
  cycleRepeatCount: number; // T
  photosOnlyMinutes: number; // M
  cycleBlankMinutes: number; // B
};

export const defaultSettings: Settings = {
  photoDuration: 10,
  blankDuration: 3,
  randomize: false,
  scrollSpeed: 50,
  randomizeAllPhotos: false,
  randomizeInPhotoGroups: true,
  enabledPhotoCategories: [],
  messageFontSize: 48,
  displayPhotos: true,
  displayMessages: true,
  useBlankScreens: true,
  monitorActivity: false,
  photoDisplayMode: 'maxWidthCrop',
  photoZoomCurve: 'none',
  photoZoomCurveMultiplier: 1,
  morningStartHour: 6,
  afternoonStartHour: 12,
  eveningStartHour: 18,
  nightStartHour: 22,
  theme: 'light',
  cyclePhotosCount: 5,
  cycleRepeatCount: 1,
  photosOnlyMinutes: 1,
  cycleBlankMinutes: 1,
};
