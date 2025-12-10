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

interface WorldStat {
  world: string | null;
  totalBooks: number;
  collectedBooks: number;
  percentage: number;
}

interface CompletionSidebarProps {
  stats: CompletionStat[];
  worldStats?: WorldStat[];
}

export default function CompletionSidebar({ stats, worldStats }: CompletionSidebarProps) {
  const getColorClass = (percentage: number) => {
    if (percentage >= 67) return 'text-green-600';
    if (percentage >= 34) return 'text-yellow-600';
    return 'text-red-600';
  };

  const oWoDStats = worldStats?.find((s) => s.world === 'oWoD');
  const codStats = worldStats?.find((s) => s.world === 'CoD');

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Collection Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* World breakdown */}
        {worldStats && (oWoDStats || codStats) && (
          <div className="space-y-3 pb-4 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground">By World</h3>
            {oWoDStats && (
              <div className="rounded-lg p-3 bg-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Old World of Darkness</div>
                  <Badge variant="outline">{oWoDStats.percentage}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={oWoDStats.percentage} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {oWoDStats.collectedBooks}/{oWoDStats.totalBooks}
                  </span>
                </div>
              </div>
            )}
            {codStats && (
              <div className="rounded-lg p-3 bg-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Chronicles of Darkness</div>
                  <Badge variant="outline">{codStats.percentage}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={codStats.percentage} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {codStats.collectedBooks}/{codStats.totalBooks}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Per product line */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">By Product Line</h3>
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
