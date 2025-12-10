'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CompletionStat {
  productLineId: number;
  productLineName: string;
  totalBooks: number;
  collectedBooks: number;
  percentage: number;
}

interface CompletionSidebarProps {
  stats: CompletionStat[];
}

export default function CompletionSidebar({ stats }: CompletionSidebarProps) {
  const getColorClass = (percentage: number) => {
    if (percentage >= 67) return 'text-green-600';
    if (percentage >= 34) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Collection Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Per product line */}
        <div className="space-y-3">
          {stats
            .filter((stat) => stat.totalBooks > 0)
            .sort((a, b) => b.percentage - a.percentage)
            .map((stat) => (
              <div
                key={stat.productLineId}
                className="rounded-lg p-3 transition-colors hover:bg-accent cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm truncate flex-1">
                    {stat.productLineName}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {stat.percentage}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={stat.percentage} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {stat.collectedBooks}/{stat.totalBooks}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
