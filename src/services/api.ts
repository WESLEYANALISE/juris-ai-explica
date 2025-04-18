import { BookData, SubjectData } from "@/types";
import { cacheUtils } from "@/utils/cache";

// The Google Sheet ID from the provided URL
const SPREADSHEET_ID = "1-RVXr9sFxJOGmiHmTwqtLkFyykeBBBYPguaED58wVHQ";
const API_KEY = "AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8"; // Using the provided Gemini API key

// This function fetches data from a Google Sheet
export async function fetchSheetData(sheetName: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length <= 1) {
      console.warn(`No data found in sheet: ${sheetName}`);
      return [];
    }
    
    // Assume first row is headers
    const headers = data.values[0];
    const rows = data.values.slice(1);
    
    return rows.map((row: any[]) => {
      const item: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        item[header] = index < row.length ? row[index] : '';
      });
      return item;
    });
    
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

// This function fetches all data and caches it
async function fetchAndCacheAllData(): Promise<{
  subjects: SubjectData[];
  booksBySubject: Record<string, BookData[]>;
}> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.sheets || data.sheets.length === 0) {
      console.warn("No sheets found in the spreadsheet");
      return { subjects: [], booksBySubject: {} };
    }

    const booksBySubject: Record<string, BookData[]> = {};
    const subjects: SubjectData[] = await Promise.all(
      data.sheets.map(async (sheet: any) => {
        const sheetName = sheet.properties.title;
        const books = await fetchBooksBySubject(sheetName);
        booksBySubject[sheetName] = books;
        
        return {
          name: sheetName,
          id: sheetName.toLowerCase().replace(/\s+/g, '-'),
          icon: books.length > 0 ? books[0].coverImage : ""
        };
      })
    );

    // Cache the data
    cacheUtils.set(subjects, booksBySubject);
    
    return { subjects, booksBySubject };
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return { subjects: [], booksBySubject: {} };
  }
}

// This function fetches the sheet names (subjects)
export async function fetchSubjects(): Promise<SubjectData[]> {
  // Try to get from cache first
  const cached = cacheUtils.get();
  if (cached) {
    return cached.subjects;
  }
  
  // If not in cache, fetch all data
  const { subjects } = await fetchAndCacheAllData();
  return subjects;
}

// This function fetches books by subject
export async function fetchBooksBySubject(subject: string): Promise<BookData[]> {
  // Try to get from cache first
  const cached = cacheUtils.get();
  if (cached && cached.booksBySubject[subject]) {
    return cached.booksBySubject[subject];
  }
  
  try {
    const rows = await fetchSheetData(subject);
    
    return rows.map((row, index) => ({
      id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      title: row.A || row.Title || row.Nome || "",
      readLink: row.ReadLink || row.Link || "",
      coverImage: row.CoverImage || row.Imagem || "",
      synopsis: row.Synopsis || row.Sinopse || "",
      rating: row.Rating || row.Nota || "",
      order: parseInt(row.Order || row.Ordem || "0", 10),
      downloadLink: row.DownloadLink || row.Download || "",
      subject: subject
    })).sort((a, b) => a.order - b.order);
    
  } catch (error) {
    console.error(`Error fetching books for subject ${subject}:`, error);
    return [];
  }
}

// This function generates AI explanation using Gemini API
export async function generateAIExplanation(title: string, synopsis: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Explique com linguagem simples o conteúdo do livro ${title}, que trata sobre ${synopsis}.` }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to generate AI explanation: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           "Não foi possível gerar uma explicação para este livro.";
    
  } catch (error) {
    console.error("Error generating AI explanation:", error);
    return "Erro ao gerar explicação. Por favor, tente novamente mais tarde.";
  }
}

// Local storage utilities for favorites and history
export const userStorage = {
  getFavorites: (): string[] => {
    const favorites = localStorage.getItem('juris-favorites');
    return favorites ? JSON.parse(favorites) : [];
  },
  
  addFavorite: (bookId: string): void => {
    const favorites = userStorage.getFavorites();
    if (!favorites.includes(bookId)) {
      favorites.push(bookId);
      localStorage.setItem('juris-favorites', JSON.stringify(favorites));
    }
  },
  
  removeFavorite: (bookId: string): void => {
    const favorites = userStorage.getFavorites();
    const updatedFavorites = favorites.filter(id => id !== bookId);
    localStorage.setItem('juris-favorites', JSON.stringify(updatedFavorites));
  },
  
  getHistory: (): Array<{bookId: string; lastRead: string; progress: number}> => {
    const history = localStorage.getItem('juris-history');
    return history ? JSON.parse(history) : [];
  },
  
  addToHistory: (bookId: string, progress: number = 0): void => {
    const history = userStorage.getHistory();
    const existingEntry = history.findIndex(item => item.bookId === bookId);
    
    if (existingEntry !== -1) {
      history[existingEntry] = { 
        bookId, 
        lastRead: new Date().toISOString(), 
        progress 
      };
    } else {
      history.push({ 
        bookId, 
        lastRead: new Date().toISOString(), 
        progress 
      });
    }
    
    localStorage.setItem('juris-history', JSON.stringify(history));
  }
};

// New function to preload all data
export async function preloadAllData(): Promise<void> {
  const cached = cacheUtils.get();
  if (!cached) {
    await fetchAndCacheAllData();
  }
}
