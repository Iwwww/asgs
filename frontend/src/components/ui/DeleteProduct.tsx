"use client";

import { useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    try {
      await deleteProduct(productId);
      toast({
        title: "Продукт удалён",
        description: "Продукт был успешно удалён.",
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении продукта.",
        variant: "destructive",
      });
      console.error("Ошибка при удалении продукта:", error);
    }
  }, [productId, deleteProduct, onDeleteSuccess, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2 h-8">
          <Trash2 className="h-4 w-4" />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Вы уверены, что хотите удалить этот продукт?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Это действие невозможно отменить. В результате товар будет
            безвозвратно удален.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
