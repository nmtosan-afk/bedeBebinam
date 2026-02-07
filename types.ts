
export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  year: string;
  genre: string[];
  rating: string;
  voteCount: string;
  director: string;
  actors: string[];
  description: string;
  moodReason: string;
  posterUrl: string;
  streamUrl?: string;
  trailerUrl?: string;
}

export interface User {
  name: string;
  email: string;
  picture: string;
  isLoggedIn: boolean;
}

export interface UserPreferences {
  mood: string;
  genres: string[];
  additionalInfo: string;
  excludedTitles?: string[];
}

export enum AppState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  WATCHLIST = 'WATCHLIST'
}

export const MOODS = [
  { id: 'happy', label: 'شاد و پرانرژی', icon: '😊' },
  { id: 'sad', label: 'غمگین و احساسی', icon: '😢' },
  { id: 'thoughtful', label: 'فکری و عمیق', icon: '🤔' },
  { id: 'scared', label: 'هیجان‌زده و ترسیده', icon: '😱' },
  { id: 'romantic', label: 'عاشقانه', icon: '❤️' },
  { id: 'bored', label: 'حوصله‌سررفته', icon: '🥱' },
];

export const GENRES = [
  'اکشن', 'کمدی', 'درام', 'ترسناک', 'علمی تخیلی', 
  'فانتزی', 'جنایی', 'مستند', 'انیمیشن', 'ماجراجویی', 
  'تاریخی', 'بیوگرافی', 'معمایی', 'وسترن', 'جنگی', 
  'موزیکال', 'خانوادگی', 'فیلم کوتاه', 'روان‌شناختی',
  'اجتماعی', 'نوآر', 'رزمی', 'ورزشی', 'ابرقهرمانی'
];
