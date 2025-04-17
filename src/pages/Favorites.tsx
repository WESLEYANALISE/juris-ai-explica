
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import BookList from "@/components/book-list";
import { BookData } from "@/types";
import { fetchSubjects, fetchBooksBySubject, userStorage } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function Favorites() {
  const [favoriteBooks, setFavoriteBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const favorites = userStorage.getFavorites();
        
        if (favorites.length === 0) {
          setFavoriteBooks([]);
          setIsLoading(false);
          return;
        }
        
        // We need to get all books from all subjects to find the favorites
        const subjects = await fetchSubjects();
        let allBooks: BookData[] = [];
        
        // Get books from each subject
        for (const subject of subjects) {
          const books = await fetchBooksBySubject(subject.name);
          allBooks = [...allBooks, ...books];
        }
        
        // Filter for favorite books
        const favoriteBooks = allBooks.filter(book => favorites.includes(book.id));
        setFavoriteBooks(favoriteBooks);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, []);
  
  return (
    <Layout title="Meus Favoritos">
      <div className="container px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          </div>
        ) : favoriteBooks.length > 0 ? (
          <BookList books={favoriteBooks} />
        ) : (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <h2 className="mt-6 text-2xl font-bold">Nenhum favorito ainda</h2>
            <p className="mt-2 text-muted-foreground">
              Adicione livros aos seus favoritos clicando no ícone de coração em qualquer livro.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
