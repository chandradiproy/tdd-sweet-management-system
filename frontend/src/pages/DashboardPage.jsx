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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PREDEFINED_CATEGORIES = ['Candy', 'Chocolate', 'Cookie', 'Cupcake', 'Gummy', 'Indian Sweets', 'Pastry', 'Other'];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { sweets, pages, total, isLoading, fetchSweets, purchaseSweet, restockSweet, deleteSweetById } = useSweetStore();
  
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy]);

  useEffect(() => {
    fetchSweets(searchTerm, currentPage, 8, filterCategory, sortBy);
  }, [fetchSweets, searchTerm, currentPage, filterCategory, sortBy]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for sweets..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PREDEFINED_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value === 'default' ? '' : value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A-Z</SelectItem>
            <SelectItem value="name-desc">Name: Z-A</SelectItem>
          </SelectContent>
        </Select>
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