
interface BookRatingBadgeProps {
  rating: string;
}

export function BookRatingBadge({ rating }: BookRatingBadgeProps) {
  return (
    <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-bold">
      {rating}
    </div>
  );
}
