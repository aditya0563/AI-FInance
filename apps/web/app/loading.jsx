import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="container mx-auto p-8 space-y-8 animate-pulse">
      {/* Header/Title block */}
      <Skeleton className="h-12 w-64 rounded-md" />
      <Skeleton className="h-4 w-96 rounded-md" />
      
      {/* Paragraph/card blocks */}
      <div className="space-y-4 pt-8">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[90%] rounded-md" />
        <Skeleton className="h-4 w-[85%] rounded-md" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
