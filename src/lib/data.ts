
export type Message = {
  id: number;
  content: string;
  schedule: string;
  status: 'Active' | 'Scheduled' | 'Expired';
};

export type Photo = {
  id: number;
  src: string;
  alt: string;
  'data-ai-hint': string;
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
};

export const initialMessages: Message[] = [
  {
    id: 1,
    content: 'Welcome to our facility. We are glad to have you.',
    schedule: 'Always Active',
    status: 'Active',
  },
  {
    id: 2,
    content: 'Annual summer picnic this Saturday at 12:00 PM.',
    schedule: '2024-07-20 to 2024-07-27',
    status: 'Scheduled',
  },
  {
    id: 3,
    content: 'Movie night tonight in the common room at 7 PM.',
    schedule: '2024-07-22',
    status: 'Expired',
  },
];

export const initialPhotoGroups: PhotoGroups = {
  family: [
    {
      id: 1,
      src: 'https://placehold.co/800x600',
      alt: 'Family at the beach',
      'data-ai-hint': 'family beach',
    },
    {
      id: 2,
      src: 'https://placehold.co/600x800',
      alt: 'Grandparents smiling',
      'data-ai-hint': 'old couple',
    },
  ],
  events: [
    {
      id: 3,
      src: 'https://placehold.co/700x500',
      alt: 'Birthday party',
      'data-ai-hint': 'birthday party',
    },
  ],
  scenery: [
    {
      id: 4,
      src: 'https://placehold.co/900x600',
      alt: 'Mountain landscape',
      'data-ai-hint': 'mountain landscape',
    },
    {
      id: 5,
      src: 'https://placehold.co/600x900',
      alt: 'City skyline at night',
      'data-ai-hint': 'city night',
    },
    {
      id: 6,
      src: 'https://placehold.co/800x500',
      alt: 'Forest path',
      'data-ai-hint': 'forest path',
    },
  ],
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
};
