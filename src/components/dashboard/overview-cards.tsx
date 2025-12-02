'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import { isAfter } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { Instrument } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewCards() {
  const firestore = useFirestore();
  const query = useMemoFirebase(() => firestore ? collection(firestore, 'instruments') : null, [firestore]);
  const { data: instruments, isLoading } = useCollection<Instrument>(query);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalInstruments = instruments?.length || 0;
  const operational = instruments?.filter(inst => inst.status === 'Operational').length || 0;
  const needsMaintenance = instruments?.filter(inst => inst.status === 'Needs Maintenance').length || 0;
  const overdue = instruments?.filter(inst => {
    const nextDate = inst.nextMaintenanceDate?.toDate();
    return nextDate && isAfter(new Date(), nextDate) && inst.status !== 'Archived' && inst.status !== 'Out of Service';
  }).length || 0;

  const cardData = [
    { title: 'Total Instruments', value: totalInstruments, icon: FlaskConical },
    { title: 'Operational', value: operational, icon: ShieldCheck },
    { title: 'Needs Maintenance', value: needsMaintenance, icon: Wrench },
    { title: 'Overdue', value: overdue, icon: AlertTriangle, className: 'text-destructive' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className="transition-all hover:shadow-md hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.className || ''}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
