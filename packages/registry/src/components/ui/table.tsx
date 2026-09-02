import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as TablePrimitive from '@rn-primitives/table';
import * as React from 'react';
import { ScrollView, type ViewProps } from 'react-native';

/**
 * Table — RNR does not wrap @rn-primitives/table, so this is the styled shell.
 * Backs schema-display, test-results, package-info and environment-variables.
 *
 * WRAPPED IN A HORIZONTAL SCROLLVIEW BY DEFAULT. A phone-width table with more than two
 * columns has to scroll; the web's `table-layout` has no React Native equivalent, and
 * shrinking text to fit would break both the type ramp and the accessibility floor.
 *
 * Column widths are explicit flex values, never `auto` — there is no layout algorithm here
 * to infer them.
 */

function Table({ className, children, scrollable = true, ...props }: ViewProps & { scrollable?: boolean }) {
  const table = (
    <TablePrimitive.Root className={cn('w-full', className)} {...props}>
      {children}
    </TablePrimitive.Root>
  );
  if (!scrollable) return table;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {table}
    </ScrollView>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<typeof TablePrimitive.Header>) {
  return (
    <TextClassContext.Provider value="text-xs font-medium text-muted-foreground">
      <TablePrimitive.Header className={cn('border-b border-border', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function TableBody({ className, ...props }: React.ComponentProps<typeof TablePrimitive.Body>) {
  return <TablePrimitive.Body className={cn('', className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<typeof TablePrimitive.Row>) {
  return (
    <TablePrimitive.Row
      className={cn('flex-row border-b border-border active:bg-accent', className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<typeof TablePrimitive.Head>) {
  return <TablePrimitive.Head className={cn('px-3 py-2', className)} {...props} />;
}

function TableCell({ className, ...props }: React.ComponentProps<typeof TablePrimitive.Cell>) {
  return <TablePrimitive.Cell className={cn('justify-center px-3 py-2', className)} {...props} />;
}

function TableCellText({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text numberOfLines={1} className={cn('text-sm text-foreground', className)} {...props} />;
}

export { Table, TableBody, TableCell, TableCellText, TableHead, TableHeader, TableRow };
