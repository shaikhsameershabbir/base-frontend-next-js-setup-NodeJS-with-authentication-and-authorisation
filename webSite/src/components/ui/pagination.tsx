import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
                <span className="text-center sm:text-left">
                    Showing {startItem} to {endItem} of {totalItems} results
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-xl"
                >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">←</span>
                </Button>

                <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <span className="px-2 py-1 text-gray-500">...</span>
                            ) : (
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className={cn(
                                        "w-8 h-8 p-0 rounded-xl",
                                        currentPage === page && "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                    )}
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-xl"
                >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">→</span>
                </Button>
            </div>
        </div>
    );
};

export { Pagination }; 