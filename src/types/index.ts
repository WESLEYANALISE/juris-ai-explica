
export interface BookData {
  id: string;
  title: string;
  readLink: string;
  coverImage: string;
  synopsis: string;
  rating: string;
  order: number;
  downloadLink: string;
  subject: string;
}

export interface SubjectData {
  name: string;
  id: string;
  icon: string;
}

export interface UserData {
  favorites: string[];
  history: {
    bookId: string;
    lastRead: string;
    progress: number;
  }[];
}
