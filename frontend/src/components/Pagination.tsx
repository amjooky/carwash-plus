'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    colorScheme?: 'blue' | 'purple';
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    colorScheme = 'blue'
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const colors = {
        blue: {
            active: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
            hover: 'hover:bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-600'
        },
        purple: {
            active: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            hover: 'hover:bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-600'
        }
    };

    const theme = colors[colorScheme];

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) {
        return (
            <div className="flex items-center justify-center py-4">
                <p className="text-sm text-slate-600">
                    Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            {/* Items info */}
            <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
                <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalItems}</span> items
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`rounded-lg p-2 transition ${currentPage === 1
                            ? 'cursor-not-allowed text-slate-300'
                            : `${theme.text} ${theme.hover}`
                        }`}
                    title="First page"
                >
                    <ChevronsLeft className="h-5 w-5" />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`rounded-lg p-2 transition ${currentPage === 1
                            ? 'cursor-not-allowed text-slate-300'
                            : `${theme.text} ${theme.hover}`
                        }`}
                    title="Previous page"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400">
                                    ...
                                </span>
                            );
                        }

                        const pageNum = page as number;
                        const isActive = pageNum === currentPage;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive
                                        ? `${theme.active} shadow-lg`
                                        : `border ${theme.border} bg-white text-slate-700 ${theme.hover}`
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`rounded-lg p-2 transition ${currentPage === totalPages
                            ? 'cursor-not-allowed text-slate-300'
                            : `${theme.text} ${theme.hover}`
                        }`}
                    title="Next page"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`rounded-lg p-2 transition ${currentPage === totalPages
                            ? 'cursor-not-allowed text-slate-300'
                            : `${theme.text} ${theme.hover}`
                        }`}
                    title="Last page"
                >
                    <ChevronsRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
