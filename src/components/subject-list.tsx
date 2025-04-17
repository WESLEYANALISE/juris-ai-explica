
import { SubjectData } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectListProps {
  subjects: SubjectData[];
  className?: string;
}

export default function SubjectList({ subjects, className }: SubjectListProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bold">Matérias Jurídicas</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            to={`/books/${subject.id}`}
            className="block group"
          >
            <Card className="overflow-hidden transition-all hover:shadow-md dark:shadow-primary/10">
              <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                {subject.icon ? (
                  <img
                    src={subject.icon}
                    alt={subject.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="p-6 text-4xl font-bold text-muted-foreground">
                    {subject.name.charAt(0)}
                  </div>
                )}
              </div>
              <CardContent className="p-3 text-center">
                <h3 className="font-medium">{subject.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
