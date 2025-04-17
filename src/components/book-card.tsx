
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
          {/* Cover image with title overlay */}
          <div className="aspect-[2/3] overflow-hidden relative">
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {/* Semi-transparent overlay with book title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
              <h3 className="text-sm md:text-base font-bold text-white line-clamp-3 text-left">
                {book.title}
              </h3>
              <p className="text-xs text-white/80 mt-1">{book.subject}</p>
            </div>
          </div>
          
          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-9 w-9 rounded-full opacity-90 hover:opacity-100 bg-black/50 hover:bg-black/70"
              onClick={toggleFavorite}
            >
              <Heart 
                className={cn("h-5 w-5", 
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                )} 
              />
            </Button>
            
            {book.downloadLink && (
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-9 w-9 rounded-full opacity-90 hover:opacity-100 bg-black/50 hover:bg-black/70"
                onClick={openDownload}
              >
                <Download className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>
          
          {/* Rating badge */}
          {ratingValue > 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-bold">
              {book.rating}
            </div>
          )}

          {/* Mobile-friendly read button */}
          <div className="absolute inset-x-2 -bottom-4 md:hidden">
            <Button 
              variant="default" 
              className="w-full gap-2 shadow-lg" 
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Ler Agora
            </Button>
          </div>
        </div>
        
        {/* Additional spacing for mobile button */}
        <div className="h-4 md:hidden" />
      </Card>
    </Link>
  );
}
