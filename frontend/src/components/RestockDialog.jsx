// File Path: frontend/src/components/RestockDialog.jsx
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PackagePlus, LoaderCircle } from 'lucide-react';

export const RestockDialog = ({ sweet, onRestock }) => {
  const [amount, setAmount] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRestock = async () => {
    setIsLoading(true);
    await onRestock(sweet._id, amount, sweet.name);
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><PackagePlus className="mr-2 h-4 w-4" /> Restock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restock {sweet.name}</DialogTitle>
          <DialogDescription>Enter the quantity to add to the current stock.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="quantity">Quantity to Add</Label>
          <Input 
            id="quantity" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            min="1"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleRestock} disabled={isLoading || amount <= 0}>
             {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : null}
            Confirm Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

