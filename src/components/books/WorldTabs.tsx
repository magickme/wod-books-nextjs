'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type WorldFilter = 'all' | 'oWoD' | 'CoD';

interface WorldTabsProps {
  activeTab: WorldFilter;
  onTabChange: (tab: WorldFilter) => void;
  stats?: Array<{
    world: string | null;
    totalBooks: number;
    collectedBooks: number;
    percentage: number;
  }>;
}

export default function WorldTabs({ activeTab, onTabChange, stats }: WorldTabsProps) {
  const oWoDStats = stats?.find((s) => s.world === 'oWoD');
  const codStats = stats?.find((s) => s.world === 'CoD');
  const totalBooks = stats?.reduce((sum, s) => sum + s.totalBooks, 0) || 0;
  const totalCollected = stats?.reduce((sum, s) => sum + Number(s.collectedBooks), 0) || 0;

  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={activeTab === 'all' ? 'default' : 'outline'}
        onClick={() => onTabChange('all')}
        className="flex-1"
      >
        All Books
        <span className="ml-2 text-xs opacity-70">
          ({totalCollected}/{totalBooks})
        </span>
      </Button>
      <Button
        variant={activeTab === 'oWoD' ? 'default' : 'outline'}
        onClick={() => onTabChange('oWoD')}
        className="flex-1"
      >
        Old World of Darkness
        {oWoDStats && (
          <span className="ml-2 text-xs opacity-70">
            ({oWoDStats.collectedBooks}/{oWoDStats.totalBooks})
          </span>
        )}
      </Button>
      <Button
        variant={activeTab === 'CoD' ? 'default' : 'outline'}
        onClick={() => onTabChange('CoD')}
        className="flex-1"
      >
        Chronicles of Darkness
        {codStats && (
          <span className="ml-2 text-xs opacity-70">
            ({codStats.collectedBooks}/{codStats.totalBooks})
          </span>
        )}
      </Button>
    </div>
  );
}
