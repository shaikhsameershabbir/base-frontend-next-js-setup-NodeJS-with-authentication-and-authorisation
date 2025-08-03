import React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    children: React.ReactNode;
}

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
    children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: React.ReactNode;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
    children: React.ReactNode;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, children, ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            >
                {children}
            </table>
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
    )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
    )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tfoot ref={ref} className={cn("bg-blue-500 font-medium text-white", className)} {...props} />
    )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
    ({ className, children, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn(
                "border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100",
                className
            )}
            {...props}
        >
            {children}
        </tr>
    )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
    ({ className, children, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-gray-700 [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        >
            {children}
        </th>
    )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ className, children, ...props }, ref) => (
        <td
            ref={ref}
            className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
            {...props}
        >
            {children}
        </td>
    )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption ref={ref} className={cn("mt-4 text-sm text-gray-500", className)} {...props} />
    )
);
TableCaption.displayName = "TableCaption";

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}; 