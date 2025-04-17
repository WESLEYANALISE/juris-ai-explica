
interface BookRatingBadgeProps {
  rating: string;
}

export function BookRatingBadge({ rating }: BookRatingBadgeProps) {
  return (
    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-bold">
      {rating}
    </div>
  );
}
