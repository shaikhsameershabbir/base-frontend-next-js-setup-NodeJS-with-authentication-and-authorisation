import React from "react";

interface PaginationProps {
  currentPage: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  itemsPerPage: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onPrevClick,
  onNextClick,
  itemsPerPage,
  totalItems
}) => {
  return (
    <div className="flex items-center gap-4 justify-center pt-1 pb-16">
      <button
        onClick={onPrevClick}
        className="bg-primary text-white font-semibold px-4 py-2 rounded-full flex items-center disabled:opacity-50"
        disabled={currentPage === 1}
      >
        &larr; Prev
      </button>

      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-bold">
        {currentPage}
      </div>

      <button
        onClick={onNextClick}
        className="bg-primary text-white font-semibold px-4 py-2 rounded-full flex items-center disabled:opacity-50"
        disabled={currentPage * itemsPerPage >= totalItems}
      >
        Next &rarr;
      </button>
    </div>
  );
};
