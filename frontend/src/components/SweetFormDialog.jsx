// File Path: frontend/src/components/SweetFormDialog.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoaderCircle } from "lucide-react";

export const SweetFormDialog = ({ sweet, onSave, children, open, onOpenChange }) => {
  const [formData, setFormData] = useState({ name: '', category: '', price: '', quantity: '' });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!sweet;

  useEffect(() => {
    // When the dialog opens, sync form state with the sweet prop
    if (open) {
      if (isEditing) {
        setFormData({
          name: sweet.name || '',
          category: sweet.category || '',
          price: sweet.price?.toString() || '',
          quantity: sweet.quantity?.toString() || '',
        });
      } else {
        // Reset form for adding new sweet
        setFormData({ name: '', category: '', price: '', quantity: '' });
      }
    }
  }, [sweet, isEditing, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSave = {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10)
      };
      await onSave(dataToSave);
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      // Error is handled by the store's toast message
      console.error("Failed to save sweet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Sweet' : 'Add New Sweet'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the sweet.' : 'Fill in the details for the new sweet.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" value={formData.category} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : null}
              {isEditing ? 'Save Changes' : 'Add Sweet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
