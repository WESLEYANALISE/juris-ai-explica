
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function MobileReadButton() {
  return (
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
  );
}
