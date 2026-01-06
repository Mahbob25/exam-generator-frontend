import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* List Items */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 border rounded-xl space-y-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex gap-6">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-10 mx-auto" />
                                    <Skeleton className="h-6 w-12 mx-auto" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-10 mx-auto" />
                                    <Skeleton className="h-6 w-12 mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
