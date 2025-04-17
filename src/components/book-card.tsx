
import { BookData } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userStorage } from "@/services/api";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookData;
  className?: string;
}

export default function BookCard({ book, className }: BookCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const favorites = userStorage.getFavorites();
    setIsFavorite(favorites.includes(book.id));
  }, [book.id]);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      userStorage.removeFavorite(book.id);
    } else {
      userStorage.addFavorite(book.id);
    }
    
    setIsFavorite(!isFavorite);
  };
  
  const openDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (book.downloadLink) {
      window.open(book.downloadLink, '_blank');
    }
  };
  
  const getRatingValue = (rating: string) => {
    const match = rating.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  
  const ratingValue = getRatingValue(book.rating);
  
  return (
    <Link to={`/reader/${book.subject}/${book.id}`} className={cn("block group", className)}>
      <Card className="overflow-hidden h-full bg-card transition-all hover:shadow-lg dark:shadow-primary/10">
        <div className="relative">
          {/* Cover image */}
          <div className="aspect-[2/3] overflow-hidden">
            <img 
              src={book.coverImage || '/placeholder.svg'} 
              alt={book.title}
              className="book-cover w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          
          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              onClick={toggleFavorite}
            >
              <Heart 
                className={cn("h-4 w-4", 
                  isFavorite ? "fill-red-500 text-red-500" : ""
                )} 
              />
            </Button>
            
            {book.downloadLink && (
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                onClick={openDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Rating badge */}
          {ratingValue > 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-bold book-rating">
              {book.rating}
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-bold line-clamp-2 text-sm">{book.title}</h3>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3 mr-1" />
            <span>{book.subject}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
