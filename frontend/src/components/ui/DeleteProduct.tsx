"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useApi } from "@/hooks/useApi";

interface DeleteProductProps {
  productId: number;
  onDeleteSuccess?: () => void;
}

export default function DeleteProduct({
  productId,
  onDeleteSuccess,
}: DeleteProductProps) {
  const { deleteProduct } = useApi();
  const { toast } = useToast();

  const handleDelete = useCallback(async () => {
    if (window.confirm("Вы уверены, что хотите удалить этот продукт?")) {
      try {
        await deleteProduct(productId);
        toast({
          title: "Product deleted",
          description: "The product was successfully deleted.",
        });

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an error deleting the product.",
          variant: "destructive",
        });
        console.error("Error deleting product:", error);
      }
    }
  }, [productId, deleteProduct, onDeleteSuccess, toast]);

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      className="flex items-center gap-2 h-8"
    >
      <Trash2 className="h-4 w-4" />
      Удалить
    </Button>
  );
}
