
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { BookData } from "@/types";
import { fetchSubjects, fetchBooksBySubject, userStorage } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { History as HistoryIcon, Book, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HistoryItem {
  book: BookData;
  lastRead: string;
  progress: number;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const history = userStorage.getHistory();
        
        if (history.length === 0) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }
        
        // We need to get all books from all subjects to find the history items
        const subjects = await fetchSubjects();
        let allBooks: BookData[] = [];
        
        // Get books from each subject
        for (const subject of subjects) {
          const books = await fetchBooksBySubject(subject.name);
          allBooks = [...allBooks, ...books];
        }
        
        // Match history items with books
        const historyWithBooks = history
          .filter(h => allBooks.some(book => book.id === h.bookId))
          .map(h => {
            const book = allBooks.find(b => b.id === h.bookId)!;
            return {
              book,
              lastRead: h.lastRead,
              progress: h.progress
            };
          })
          .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime());
        
        setHistoryItems(historyWithBooks);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Layout title="Histórico de Leitura">
      <div className="container px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : historyItems.length > 0 ? (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <Link 
                key={item.book.id} 
                to={`/reader/${item.book.subject}/${item.book.id}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-start p-4">
                      {/* Book cover */}
                      <div className="w-16 h-24 rounded overflow-hidden shrink-0 mr-4">
                        <img 
                          src={item.book.coverImage} 
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {item.book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.book.subject}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Último acesso: {formatDate(item.lastRead)}</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span>{item.progress.toFixed(0)}% concluído</span>
                            <span className={cn(
                              item.progress === 100 ? "text-green-500 dark:text-green-400" : ""
                            )}>
                              {item.progress === 100 ? "Concluído" : "Em progresso"}
                            </span>
                          </div>
                          <Progress value={item.progress} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <HistoryIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <h2 className="mt-6 text-2xl font-bold">Histórico vazio</h2>
            <p className="mt-2 text-muted-foreground">
              Seu histórico de leitura aparecerá aqui quando você começar a ler livros.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
