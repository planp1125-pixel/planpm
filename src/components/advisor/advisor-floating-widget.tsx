'use client';

import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdvisorSummaryPanel } from './advisor-summary-panel';

type AdvisorFloatingWidgetProps = {
  instrumentId?: string;
};

export function AdvisorFloatingWidget({ instrumentId }: AdvisorFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {isOpen && (
          <Card className="w-[360px] sm:w-[460px] max-h-[80vh] shadow-2xl border-primary/20">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-none">Predictive Advisor</p>
                  <p className="text-xs text-muted-foreground">Quick summaries or ask for guidance.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-4 text-xs text-muted-foreground">
              Quick counts of overdue, upcoming, partial, and recent completions. Export to PDF from here.
            </div>
            <div className="p-4 pb-5 max-h-[70vh] overflow-y-auto">
              <AdvisorSummaryPanel />
            </div>
          </Card>
        )}

        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Bot className="mr-2 h-4 w-4" />
          {isOpen ? 'Hide Advisor' : 'Predictive Advisor'}
        </Button>
      </div>
    </>
  );
}
