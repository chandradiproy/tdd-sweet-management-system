// File Path: frontend/src/components/CartDialog.jsx
import React from 'react';
import useCartStore from '@/store/cartStore';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { LoaderCircle, Trash2 } from 'lucide-react';

export const CartDialog = ({ open, onOpenChange }) => {
  const { items, totalPrice, isCheckingOut, updateItemQuantity, removeItem, checkout } = useCartStore();

  const handleCheckout = async () => {
    const success = await checkout();
    if (success) {
      onOpenChange(false); // Close dialog on successful checkout
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Shopping Cart</DialogTitle>
          <DialogDescription>Review your items before checking out.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground">Your cart is empty.</p>
            ) : (
              items.map(item => (
                <div key={item.sweetId._id} className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <p className="font-semibold">{item.sweetId.name}</p>
                    <p className="text-sm text-muted-foreground">${item.sweetId.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={item.sweetId.quantity}
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.sweetId._id, parseInt(e.target.value, 10))}
                      className="w-16 h-8"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.sweetId._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {items.length > 0 && (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-lg font-bold">Total: ${totalPrice.toFixed(2)}</div>
            <Button onClick={handleCheckout} disabled={isCheckingOut} className="w-full sm:w-auto">
              {isCheckingOut && <LoaderCircle className="animate-spin mr-2" />}
              Checkout
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};