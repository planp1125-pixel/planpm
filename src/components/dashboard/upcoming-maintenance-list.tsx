'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, isBefore, addDays } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, query, where, orderBy } from 'firebase/firestore';
import type { Instrument } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function UpcomingMaintenanceList() {
  const firestore = useFirestore();

  const upcomingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const now = Timestamp.now();
    const thirtyDaysFromNow = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
    
    return query(
      collection(firestore, 'instruments'),
      where('nextMaintenanceDate', '>=', now),
      where('nextMaintenanceDate', '<=', thirtyDaysFromNow),
      orderBy('nextMaintenanceDate', 'asc')
    );
  }, [firestore]);

  const { data: upcoming, isLoading } = useCollection<Instrument>(upcomingQuery);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Upcoming Maintenance</CardTitle>
        <CardDescription>Instruments requiring maintenance in the next 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instrument</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Days Left</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-24"/></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto"/></TableCell>
                </TableRow>
              ))
            ) : upcoming && upcoming.length > 0 ? (
              upcoming.map(inst => {
                if (!inst.nextMaintenanceDate) return null;
                const dueDate = inst.nextMaintenanceDate.toDate();
                const daysLeft = differenceInDays(dueDate, new Date());
                return (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-sm text-muted-foreground">{inst.serialNumber}</div>
                    </TableCell>
                    <TableCell>{inst.location}</TableCell>
                    <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={daysLeft <= 7 ? 'destructive' : 'secondary'}>{daysLeft} days</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No upcoming maintenance in the next 30 days.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
