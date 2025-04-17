
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookData, SubjectData } from "@/types";
import { Book, BrainCircuit, BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SubjectList from "@/components/subject-list";
import BookList from "@/components/book-list";
import { fetchSubjects, fetchBooksBySubject, userStorage } from "@/services/api";

export default function Index() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<BookData[]>([]);
  const [recentBooks, setRecentBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch subjects
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData);
        
        // If we have subjects, fetch some books from the first subject as featured
        if (subjectsData.length > 0) {
          const firstSubjectBooks = await fetchBooksBySubject(subjectsData[0].name);
          // Take top rated books as featured
          const sorted = [...firstSubjectBooks].sort((a, b) => {
            const ratingA = parseInt(a.rating.match(/\d+/)?.[0] || "0", 10);
            const ratingB = parseInt(b.rating.match(/\d+/)?.[0] || "0", 10);
            return ratingB - ratingA;
          });
          
          setFeaturedBooks(sorted.slice(0, 6));
        }
        
        // Load history
        const history = userStorage.getHistory();
        if (history.length > 0) {
          // We need to match the book IDs from history with actual books
          // This is a simplified approach for demo
          const recentBooksIds = history
            .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
            .map(h => h.bookId)
            .slice(0, 6);
            
          if (subjectsData.length > 0) {
            // For demo, just use some books from first subject
            const allBooks = await fetchBooksBySubject(subjectsData[0].name);
            setRecentBooks(allBooks.slice(0, 6));
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <Layout>
      {/* Hero section */}
      <section className="bg-gradient-to-b from-legal-dark to-background py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Sua Biblioteca Jurídica Interativa
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Acesse uma vasta coleção de conteúdo jurídico organizado por matérias, com acesso instantâneo à leitura, explicações por IA e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link to="/books">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explorar Biblioteca
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/favorites">
                    <Heart className="h-5 w-5 mr-2" />
                    Meus Favoritos
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-1/2 h-1/2 bg-legal-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-1/2 h-1/2 bg-legal-accent/20 rounded-full blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {isLoading ? (
                  <>
                    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  </>
                ) : featuredBooks.length > 0 ? (
                  featuredBooks.slice(0, 4).map((book) => (
                    <Link 
                      key={book.id} 
                      to={`/reader/${book.subject}/${book.id}`}
                      className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl transition-transform hover:-translate-y-1"
                    >
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center p-12 bg-card rounded-xl">
                    <div className="text-center">
                      <Book className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">Carregando livros...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Recursos Destacados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Leitor Integrado</h3>
                <p className="text-muted-foreground">
                  Leia os livros diretamente no aplicativo, sem necessidade de baixar ou instalar leitores adicionais.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">IA Explica</h3>
                <p className="text-muted-foreground">
                  Receba explicações simplificadas sobre o conteúdo dos livros, geradas por inteligência artificial.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Favoritos e Histórico</h3>
                <p className="text-muted-foreground">
                  Salve seus livros preferidos e acompanhe seu progresso de leitura com o histórico integrado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Subjects section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
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
      </section>
      
      {/* Recent books section */}
      {recentBooks.length > 0 && (
        <section className="py-16 container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Continuar Lendo</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentBooks.map((book) => (
              <Link 
                key={book.id} 
                to={`/reader/${book.subject}/${book.id}`}
                className="block group"
              >
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-[2/3] overflow-hidden relative">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-muted-foreground">{book.subject}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
