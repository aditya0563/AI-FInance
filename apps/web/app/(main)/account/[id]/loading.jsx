import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-8 px-5 animate-pulse">
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

      <Skeleton className="h-[350px] w-full rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
