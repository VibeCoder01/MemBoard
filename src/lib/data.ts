
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
  storagePath: string; // Path in Firebase Storage to allow for deletion
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
};
