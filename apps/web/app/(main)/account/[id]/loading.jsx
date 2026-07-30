import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-8 px-5 animate-pulse">
      {/* Account Header */}
      <div className="flex gap-4 items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-14 w-64 rounded-md" />
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>
        <div className="text-right pb-2 space-y-2">
          <Skeleton className="h-8 w-24 rounded-md ml-auto" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>

      {/* AccountChart Skeleton */}
      <Skeleton className="h-[350px] w-full rounded-xl" />

      {/* TransactionTable Skeleton */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-secondary/10">
        <div className="flex items-center gap-4 p-4 border-b border-border/50">
          <Skeleton className="h-8 w-[20%] rounded-md" />
          <Skeleton className="h-8 w-[30%] rounded-md" />
          <Skeleton className="h-8 w-[20%] rounded-md" />
          <Skeleton className="h-8 w-[15%] rounded-md" />
          <Skeleton className="h-8 w-[15%] rounded-md ml-auto" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/20">
            <Skeleton className="h-4 w-[20%] rounded-md" />
            <Skeleton className="h-4 w-[30%] rounded-md" />
            <Skeleton className="h-4 w-[20%] rounded-md" />
            <Skeleton className="h-4 w-[15%] rounded-md" />
            <Skeleton className="h-4 w-[15%] rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
