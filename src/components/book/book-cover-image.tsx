
import { cn } from "@/lib/utils";

interface BookCoverImageProps {
  coverImage: string;
  title: string;
  subject: string;
}

export function BookCoverImage({ coverImage, title, subject }: BookCoverImageProps) {
  return (
    <div className="aspect-[2/3] overflow-hidden relative">
      <img 
        src={coverImage} 
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
        <h3 className="text-sm md:text-base font-bold text-white line-clamp-3 text-left">
          {title}
        </h3>
        <p className="text-xs text-white/80 mt-1">{subject}</p>
      </div>
    </div>
  );
}
