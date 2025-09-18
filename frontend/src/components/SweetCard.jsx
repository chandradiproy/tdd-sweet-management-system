// File Path: frontend/src/components/SweetCard.jsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
// Replaced 'Cupcake' with 'CakeSlice' to resolve the module export error.
import { Candy, CakeSlice, Cookie, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { RestockDialog } from './RestockDialog';
import { DeleteDialog } from './DeleteDialog';

const categoryIcons = {
  Candy: <Candy className="h-5 w-5 text-pink-500" />,
  // Using CakeSlice as a replacement for Cupcake.
  Cupcake: <CakeSlice className="h-5 w-5 text-purple-500" />,
  Cookie: <Cookie className="h-5 w-5 text-yellow-500" />,
  default: <Candy className="h-5 w-5 text-gray-500" />,
};

export const SweetCard = ({ sweet, onPurchase, onRestock, onDelete, onEdit, isAdmin }) => {
  const Icon = categoryIcons[sweet.category] || categoryIcons.default;
  const isOutOfStock = sweet.quantity === 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-pink-500/10">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{sweet.name}</CardTitle>
                <CardDescription className="flex items-center pt-1">
                    {Icon}
                    <span className="ml-2">{sweet.category}</span>
                </CardDescription>
            </div>
             <div className="text-lg font-bold text-pink-500">${sweet.price.toFixed(2)}</div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
          {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
        </p>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        {isAdmin ? (
          <>
            <RestockDialog sweet={sweet} onRestock={onRestock} />
            
            <Button variant="outline" className="w-full" onClick={() => onEdit(sweet)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            
            <DeleteDialog sweetName={sweet.name} onDelete={() => onDelete(sweet._id)} />
            
            <Button variant="outline" disabled={isOutOfStock} onClick={() => onPurchase(sweet._id, sweet.name)}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
            </Button>
          </>
        ) : (
          <Button className="col-span-2" disabled={isOutOfStock} onClick={() => onPurchase(sweet._id, sweet.name)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

