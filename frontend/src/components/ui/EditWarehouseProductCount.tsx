import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCallback, useState, useMemo } from "react";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProductCount, useApi } from "@/hooks/useApi";
import QuantitySelector from "./QuantitySelector";

interface EditWarehouseProductCountProps {
  productCount: ProductCount;
  onEditSuccess?: () => void;
}

export default function EditWarehouseProductCount({
  productCount,
  onEditSuccess,
}: EditWarehouseProductCountProps) {
  const [quantity, setQuantity] = useState<number>(productCount.amount);
  const { putWarehouseProductCount } = useApi();
  const { toast } = useToast();

  const isFormValid = useMemo(() => {
    return quantity >= 0;
  }, [quantity]);

  const handleEdit = useCallback(async () => {
    const newProductCounts: ProductCount[] = [
      {
        product: productCount.product,
        amount: quantity,
      },
    ];

    try {
      const result = await putWarehouseProductCount(newProductCounts);
      toast({
        title: "Количество обновлено",
        description: "Количество товара на складе успешно обновлено.",
      });

      if (onEditSuccess) {
        onEditSuccess();
      }

      console.log("Количество успешно обновлено:", result);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении количества.",
        variant: "destructive",
      });
      console.error("Ошибка при обновлении количества:", error);
    }
  }, [
    productCount.product_id,
    quantity,
    putWarehouseProductCount,
    toast,
    onEditSuccess,
  ]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8">
          <Edit className="h-4 w-4" />
          Изменить количество
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Изменение количества</SheetTitle>
          <SheetDescription>
            Внесите изменения в количество товара. Когда закончите, нажмите
            "Сохранить".
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Количество
            </Label>
            <QuantitySelector
              defaultValue={productCount.amount}
              min={0}
              onValueChange={(e) => setQuantity(e || 0)}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleEdit} disabled={!isFormValid}>
              Сохранить изменения
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
