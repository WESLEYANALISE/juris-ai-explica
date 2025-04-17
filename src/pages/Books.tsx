
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout";
import BookList from "@/components/book-list";
import SubjectList from "@/components/subject-list";
import { BookData, SubjectData } from "@/types";
import { fetchSubjects, fetchBooksBySubject, preloadAllData } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Books() {
  const { subject } = useParams<{ subject?: string }>();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [books, setBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await preloadAllData(); // Preload all data into cache
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData);
        
        if (subject) {
          const matchedSubject = subjectsData.find(s => s.id === subject);
          if (matchedSubject) {
            setCurrentSubject(matchedSubject.name);
          } else if (subjectsData.length > 0) {
            setCurrentSubject(subjectsData[0].name);
          }
        } else if (subjectsData.length > 0) {
          setCurrentSubject(subjectsData[0].name);
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
      }
    };
    
    loadData();
  }, [subject]);
  
  useEffect(() => {
    const loadBooks = async () => {
      if (!currentSubject) return;
      
      setIsLoading(true);
      try {
        const booksData = await fetchBooksBySubject(currentSubject);
        setBooks(booksData);
      } catch (error) {
        console.error(`Error loading books for ${currentSubject}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBooks();
  }, [currentSubject]);
  
  useEffect(() => {
    // Filter books based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.synopsis.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [books, searchQuery]);
  
  // Get the current subject name for display
  const subjectName = subjects.find(s => s.name === currentSubject)?.name || "Todos os Livros";
  
  return (
    <Layout title={subject ? subjectName : "Biblioteca Jurídica"}>
      <div className="container px-4 py-6 space-y-8">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar livros por título ou conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Subject list if no subject is selected */}
        {!subject && !searchQuery && (
          <div className="py-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <SubjectList subjects={subjects} />
            )}
          </div>
        )}
        
        {/* Books list */}
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <BookList 
              books={filteredBooks} 
              title={searchQuery ? `Resultados para "${searchQuery}"` : subjectName} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

