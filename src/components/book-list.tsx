
import { BookData } from "@/types";
import BookCard from "@/components/book-card";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Star } from "lucide-react";

interface BookListProps {
  books: BookData[];
  title?: string;
}

export default function BookList({ books, title }: BookListProps) {
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"title" | "rating" | "order">("order");
  
  useEffect(() => {
    let sorted = [...books];
    
    if (sortBy === "title") {
      sorted.sort((a, b) => {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => {
        const ratingA = parseInt(a.rating.match(/\d+/)?.[0] || "0", 10);
        const ratingB = parseInt(b.rating.match(/\d+/)?.[0] || "0", 10);
        return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
      });
    } else {
      sorted.sort((a, b) => {
        return sortOrder === "asc" ? a.order - b.order : b.order - a.order;
      });
    }
    
    setFilteredBooks(sorted);
  }, [books, sortOrder, sortBy]);
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };
  
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      
      {/* Sort controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs defaultValue="order" className="w-full md:w-auto" onValueChange={(value) => setSortBy(value as any)}>
          <TabsList>
            <TabsTrigger value="order">Ordem Recomendada</TabsTrigger>
            <TabsTrigger value="title">Título</TabsTrigger>
            <TabsTrigger value="rating">Avaliação</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <button
          onClick={toggleSortOrder}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1"
          )}
        >
          Ordenar {sortOrder === "asc" ? "A-Z" : "Z-A"}
          {sortOrder === "asc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Book grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <p className="mt-4 text-muted-foreground">Nenhum livro encontrado</p>
        </div>
      )}
    </div>
  );
}
