import { Skeleton } from "@/components/ui";

export default function GenerateLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in-50">
            {/* Header Skeleton */}
            <div className="text-center space-y-4 mb-10">
                <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto rounded-xl" />
                <Skeleton className="h-6 w-5/6 md:w-2/3 mx-auto" />
            </div>

            {/* Banner Skeleton */}
            <Skeleton className="h-24 w-full rounded-2xl" />

            {/* Form Fields Skeleton */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>

                <div className="pt-4">
                    <Skeleton className="h-14 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
}
