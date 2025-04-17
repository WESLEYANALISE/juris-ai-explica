
import { BookData, SubjectData } from "@/types";

const CACHE_KEY = 'juris-data-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  timestamp: number;
  subjects: SubjectData[];
  booksBySubject: Record<string, BookData[]>;
}

export const cacheUtils = {
  get: (): CacheData | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  },
  
  set: (subjects: SubjectData[], booksBySubject: Record<string, BookData[]>) => {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      subjects,
      booksBySubject
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  },
  
  clear: () => {
    localStorage.removeItem(CACHE_KEY);
  }
};

