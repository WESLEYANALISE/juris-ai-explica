
import { useState, useEffect, useRef } from "react";
import { BookData } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Heart, Download, Share, BrainCircuit, VolumeIcon, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { userStorage, generateAIExplanation } from "@/services/api";
import { cn } from "@/lib/utils";

interface BookReaderProps {
  book: BookData;
}

export default function BookReader({ book }: BookReaderProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Check if book is favorite
    const favorites = userStorage.getFavorites();
    setIsFavorite(favorites.includes(book.id));
    
    // Get reading progress from history
    const history = userStorage.getHistory();
    const bookHistory = history.find(item => item.bookId === book.id);
    if (bookHistory) {
      setReadingProgress(bookHistory.progress);
    }
    
    // Add to reading history
    userStorage.addToHistory(book.id, readingProgress);
    
    // Set timer to update progress periodically
    const progressInterval = setInterval(() => {
      // Simulate progress for demo
      setReadingProgress(prev => {
        const newProgress = Math.min(prev + 0.5, 100);
        userStorage.addToHistory(book.id, newProgress);
        return newProgress;
      });
    }, 30000);
    
    return () => clearInterval(progressInterval);
  }, [book.id]);
  
  const toggleFavorite = () => {
    if (isFavorite) {
      userStorage.removeFavorite(book.id);
      toast.info("Removido dos favoritos");
    } else {
      userStorage.addFavorite(book.id);
      toast.success("Adicionado aos favoritos");
    }
    
    setIsFavorite(!isFavorite);
  };
  
  const handleDownload = () => {
    if (book.downloadLink) {
      window.open(book.downloadLink, '_blank');
      toast.info("Iniciando download...");
    }
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: book.synopsis,
          url: window.location.href
        });
      } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  
  const getAIExplanation = async () => {
    if (aiExplanation) {
      setIsAiOpen(true);
      return;
    }
    
    setIsAiLoading(true);
    setIsAiOpen(true);
    
    try {
      const explanation = await generateAIExplanation(book.title, book.synopsis);
      setAiExplanation(explanation);
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      toast.error("Erro ao gerar explicação");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  return (
    <div className="relative flex flex-col h-full">
      {/* Reader toolbar */}
      <div className="sticky top-0 z-10 bg-card shadow-sm p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-bold line-clamp-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground">{book.subject}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFavorite}
          >
            <Heart 
              className={cn("h-5 w-5", 
                isFavorite ? "fill-red-500 text-red-500" : ""
              )} 
            />
          </Button>
          
          {book.downloadLink && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShare}
          >
            <Share className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={getAIExplanation}
          >
            <BrainCircuit className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Reading progress */}
      <Progress value={readingProgress} className="h-1" />
      
      {/* Document reader */}
      <div className="flex-1 min-h-0">
        {isLoading && (
          <div className="p-6">
            <Skeleton className="h-[80vh] w-full" />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={book.readLink}
          className={cn(
            "w-full h-[calc(100vh-10rem)]",
            isLoading ? "hidden" : "block"
          )}
          onLoad={() => setIsLoading(false)}
          title={book.title}
        />
      </div>
      
      {/* AI Explanation panel */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 bottom-0 p-6 bg-card border-t shadow-lg h-3/4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                IA Explica: {book.title}
              </h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAiOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto pr-2">
              {isAiLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/6" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/6" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{aiExplanation}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                disabled={isAiLoading || !aiExplanation}
              >
                <VolumeIcon className="h-4 w-4 mr-2" />
                Ouvir explicação
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
