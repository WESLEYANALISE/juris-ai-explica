
import { Button } from "@/components/ui/button";
import { Heart, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookActionsProps {
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  downloadLink?: string;
  onDownload?: (e: React.MouseEvent) => void;
}

export function BookActions({ isFavorite, onToggleFavorite, downloadLink, onDownload }: BookActionsProps) {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2">
      <Button 
        size="icon" 
        variant="secondary" 
        className="h-9 w-9 rounded-full opacity-90 hover:opacity-100 bg-black/50 hover:bg-black/70"
        onClick={onToggleFavorite}
      >
        <Heart 
          className={cn("h-5 w-5", 
            isFavorite ? "fill-red-500 text-red-500" : "text-white"
          )} 
        />
      </Button>
      
      {downloadLink && onDownload && (
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-9 w-9 rounded-full opacity-90 hover:opacity-100 bg-black/50 hover:bg-black/70"
          onClick={onDownload}
        >
          <Download className="h-5 w-5 text-white" />
        </Button>
      )}
    </div>
  );
}
