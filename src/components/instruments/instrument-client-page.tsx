'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Instrument } from '@/lib/types';
import { columns as createColumns } from './columns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AddInstrumentDialog } from './add-instrument-dialog';
import { EditInstrumentDialog } from './edit-instrument-dialog';

export function InstrumentClientPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);

  const firestore = useFirestore();

  const instrumentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'instruments');
  }, [firestore]);

  const { data: instruments, isLoading } = useCollection<Instrument>(instrumentsQuery);
  
  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument);
  };
  
  const columns = createColumns(handleEdit);

  const table = useReactTable({
    data: instruments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter instruments by Eqp. ID..."
          value={(table.getColumn('eqpId')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('eqpId')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Instrument</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <AddInstrumentDialog isOpen={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
      {editingInstrument && (
        <EditInstrumentDialog 
          isOpen={!!editingInstrument} 
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingInstrument(null);
            }
          }} 
          instrument={editingInstrument}
        />
      )}
    </div>
  );
}