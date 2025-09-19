// File Path: frontend/src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import useSweetStore from '@/store/sweetStore';
import { SweetCard } from '@/components/SweetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SweetFormDialog } from '@/components/SweetFormDialog';
import { PlusCircle, LoaderCircle, Search } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { sweets, pages, total, isLoading, fetchSweets, purchaseSweet, restockSweet, deleteSweetById } = useSweetStore();
  
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSweets(searchTerm, currentPage);
  }, [fetchSweets, searchTerm, currentPage]);

  const handleOpenEditModal = (sweet) => {
    setEditingSweet(sweet);
    setIsEditFormOpen(true);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      setCurrentPage(newPage);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your delicious inventory. Showing {sweets.length} of {total} sweets.</p>
        </div>
        {isAdmin && (
           <SweetFormDialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <Button onClick={() => setIsAddFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Sweet
            </Button>
          </SweetFormDialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for sweets..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoaderCircle className="h-12 w-12 animate-spin text-pink-500" />
        </div>
      ) : sweets.length > 0 ? (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet._id}
              sweet={sweet}
              isAdmin={isAdmin}
              onPurchase={purchaseSweet}
              onRestock={restockSweet}
              onEdit={handleOpenEditModal}
              onDelete={deleteSweetById}
            />
          ))}
        </div>
        
        {pages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {[...Array(pages).keys()].map((p) => (
                  <PaginationItem key={p + 1}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(p + 1); }} 
                      isActive={currentPage === p + 1}
                    >
                      {p + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} 
                    className={currentPage === pages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold">No Sweets Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchTerm ? `No results for "${searchTerm}".` : "Your inventory is empty."}
          </p>
        </div>
      )}

      {/* The Dialog for editing sweets */}
      {editingSweet && (
        <SweetFormDialog
          key={editingSweet._id}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
          sweet={editingSweet}
        />
      )}
    </div>
  );
};

export default DashboardPage;

