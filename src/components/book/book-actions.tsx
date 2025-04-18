
import { Button } from "@/components/ui/button";
import { Heart, Download, Share, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

interface BookActionsProps {
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  downloadLink?: string;
  onDownload?: (e: React.MouseEvent) => void;
  bookId: string;
  subject: string;
}

export function BookActions({ 
  isFavorite, 
  onToggleFavorite, 
  downloadLink, 
  onDownload, 
  bookId, 
  subject 
}: BookActionsProps) {
  const isMobile = useIsMobile();
  
  const actionButtonClass = isMobile 
    ? "h-12 w-12 rounded-full opacity-90 hover:opacity-100 bg-primary shadow-lg"
    : "h-9 w-9 rounded-full opacity-90 hover:opacity-100 bg-black/50 hover:bg-black/70";
  
  const mobileFloatingClass = isMobile 
    ? "fixed bottom-20 right-4 z-40 flex flex-col gap-3" 
    : "absolute top-2 right-2 flex flex-col gap-2";
  
  return (
    <div className={mobileFloatingClass}>
      <Button 
        size="icon" 
        variant="secondary" 
        className={actionButtonClass}
        onClick={onToggleFavorite}
      >
        <Heart 
          className={cn("h-5 w-5", 
            isFavorite ? "fill-red-500 text-red-500" : (isMobile ? "text-white" : "text-white")
          )} 
        />
      </Button>
      
      {downloadLink && onDownload && (
        <Button 
          size="icon" 
          variant="secondary" 
          className={actionButtonClass}
          onClick={onDownload}
        >
          <Download className="h-5 w-5 text-white" />
        </Button>
      )}
      
      {isMobile && (
        <Link to={`/reader/${subject}/${bookId}`}>
          <Button 
            size="icon" 
            variant="default" 
            className={actionButtonClass}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </Button>
        </Link>
      )}
    </div>
  );
}
