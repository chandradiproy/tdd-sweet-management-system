// File Path: frontend/src/components/SweetFormDialog.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LoaderCircle } from "lucide-react";
import useSweetStore from '@/store/sweetStore';
import { useToast } from "@/hooks/use-toast";

const PREDEFINED_CATEGORIES = ['Candy', 'Chocolate', 'Cookie', 'Cupcake', 'Gummy', 'Indian Sweets', 'Pastry', 'Other'];

export const SweetFormDialog = ({ sweet, children, open, onOpenChange }) => {
  const { addSweet, updateSweet } = useSweetStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', price: '', quantity: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!sweet;
  const isCustomCategory = selectedCategory === 'Other';

  useEffect(() => {
    if (open) {
      if (isEditing && sweet) {
        setFormData({
          name: sweet.name,
          price: sweet.price.toString(),
          quantity: sweet.quantity.toString(),
        });
        // If the sweet's category is one of our predefined ones, select it. Otherwise, select 'Other'.
        if (PREDEFINED_CATEGORIES.includes(sweet.category)) {
          setSelectedCategory(sweet.category);
          setCustomCategory('');
        } else {
          setSelectedCategory('Other');
          setCustomCategory(sweet.category);
        }
      } else {
        // Reset form for adding a new sweet
        setFormData({ name: '', price: '', quantity: '' });
        setSelectedCategory('');
        setCustomCategory('');
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

    const finalCategory = isCustomCategory ? customCategory : selectedCategory;
    if (!finalCategory) {
      toast({
        title: "Validation Error",
        description: "Please select or enter a category.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const dataToSave = {
      ...formData,
      category: finalCategory,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10)
    };
    
    if (isEditing) {
      await updateSweet(sweet._id, dataToSave);
    } else {
      await addSweet(dataToSave);
    }
    
    setIsLoading(false);
    onOpenChange(false); // Close the dialog on success
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
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isCustomCategory && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customCategory" className="text-right">Custom</Label>
                <Input id="customCategory" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Enter category name" className="col-span-3" required />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" value={formData.quantity} onChange={handleChange} className="col-span-3" required />
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

