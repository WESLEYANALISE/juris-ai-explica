
import { BookData } from "@/types";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { userStorage } from "@/services/api";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BookCoverImage } from "./book/book-cover-image";
import { BookActions } from "./book/book-actions";
import { BookRatingBadge } from "./book/book-rating-badge";
import { MobileReadButton } from "./book/mobile-read-button";

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
          <BookCoverImage
            coverImage={book.coverImage}
            title={book.title}
            subject={book.subject}
          />
          
          <BookActions
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            downloadLink={book.downloadLink}
            onDownload={openDownload}
          />
          
          {ratingValue > 0 && (
            <BookRatingBadge rating={book.rating} />
          )}

          <MobileReadButton />
        </div>
        
        <div className="h-4 md:hidden" />
      </Card>
    </Link>
  );
}
