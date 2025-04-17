
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout";
import BookReaderComponent from "@/components/book-reader";
import { BookData } from "@/types";
import { fetchBooksBySubject } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookReader() {
  const { subject, bookId } = useParams<{ subject: string; bookId: string }>();
  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadBook = async () => {
      if (!subject || !bookId) return;
      
      setIsLoading(true);
      try {
        // Convert hyphenated subject back to original format
        const subjectName = subject.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        const books = await fetchBooksBySubject(subjectName);
        const foundBook = books.find(b => b.id === bookId);
        
        if (foundBook) {
          setBook(foundBook);
        } else {
          console.error("Book not found:", bookId);
        }
      } catch (error) {
        console.error("Error loading book:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBook();
  }, [subject, bookId]);
  
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)]">
        {isLoading || !book ? (
          <div className="container py-8 space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-[70vh] w-full" />
          </div>
        ) : (
          <BookReaderComponent book={book} />
        )}
      </div>
    </Layout>
  );
}
