// File Path: frontend/src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import  useAuthStore  from '@/store/authStore';
import  useSweetStore  from '@/store/sweetStore';
import { SweetCard } from '@/components/SweetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SweetFormDialog } from '@/components/SweetFormDialog';
import { PlusCircle, LoaderCircle, Search } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  // FIX: Destructuring the correct actions from the store
  const { sweets, isLoading, fetchSweets, addSweet, updateSweet, deleteSweetById, purchaseSweet, restockSweet } = useSweetStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSweets(searchTerm);
  }, [fetchSweets, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingSweet(null); // Ensure we are in "add" mode
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (sweet) => {
    setEditingSweet(sweet);
    setIsFormOpen(true);
  };

  const handleSaveSweet = (sweetData) => {
    if (editingSweet) {
      updateSweet(editingSweet._id, sweetData);
    } else {
      addSweet(sweetData);
    }
  };
  
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your delicious inventory.</p>
        </div>
        {/* FIX: The SweetFormDialog now wraps the button that triggers it. */}
        {isAdmin && (
           <SweetFormDialog
            open={isFormOpen && !editingSweet} // Only open for adding new sweets
            onOpenChange={setIsFormOpen}
            sweet={null}
            onSave={handleSaveSweet}
          >
            <Button>
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoaderCircle className="h-12 w-12 animate-spin text-pink-500" />
        </div>
      ) : sweets.length > 0 ? (
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
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold">No Sweets Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchTerm ? `No results for "${searchTerm}".` : "Your inventory is empty."}
          </p>
        </div>
      )}

      {/* This Dialog instance is now specifically for editing */}
      <SweetFormDialog
        open={isFormOpen && !!editingSweet}
        onOpenChange={setIsFormOpen}
        sweet={editingSweet}
        onSave={handleSaveSweet}
      />
    </div>
  );
};

export default DashboardPage;
