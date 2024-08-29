import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SeparatorHorizontal, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Category,
  CategoryWithoutId,
  Factory,
  OrderProducts,
  Product,
  ProductWithQuantity,
  useApi,
} from "@/hooks/useApi";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface OrderProductsDialogProps {
  productsWithQuantity: ProductWithQuantity[];
  onOrderProductsSuccess?: () => void;
}

export default function OrderProductsDialog({
  productsWithQuantity,
  onOrderProductsSuccess,
}: OrderProductsDialogProps) {
  const [open, setOpen] = useState(false);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { getCategories, getFactories } = useApi();

  const totalProductsPrice: number = useMemo(() => {
    return productsWithQuantity.reduce(
      (sum: number, item: ProductWithQuantity) =>
        sum + item.product.price * item.amount,
      0,
    );
  }, []);

  const deliveryCost: number = useMemo(() => {
    const magicNumber = 0.2;
    return productsWithQuantity.reduce(
      (_, item: ProductWithQuantity) =>
        magicNumber * (item.product.weight * item.amount) + 500,
      0,
    );
  }, []);

  const totalPrice = useMemo(() => {
    return totalProductsPrice + deliveryCost;
  }, [totalProductsPrice, deliveryCost]);

  const fetchFactories = useCallback(async () => {
    try {
      const factories: Factory[] = await getFactories();
      setFactories(factories);
    } catch (error) {
      console.error("Failed to fetch factories:", error);
    }
  }, [getFactories]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [getCategories]);

  const getFactoryName = (id: number) => {
    const factory = factories.find((f) => f.id === id);
    return factory ? factory.name : "Неизвестно";
  };

  const getCategoryName = (id: number) => {
    const category = categories.find((c) => c.id === id);
    return category ? category.name : "Неизвестно";
  };

  useEffect(() => {
    fetchFactories();
    fetchCategories();
  }, [productsWithQuantity]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1" variant="default">
          <ShoppingCart className="h-3.5 w-3.5" />
          Сделать заказ
        </Button>
      </DialogTrigger>

      <DialogContent className="px-2 sm:p-6 sm:min-w-min sm:max-w-max">
        <DialogHeader className="max-w-fit sm:max-w-full">
          <DialogTitle>Таблица заказа</DialogTitle>
          <DialogDescription>Выбранные товары</DialogDescription>
        </DialogHeader>

        <div className="border rounded-md max-w-fit sm:max-w-max">
          <Table>
            <ScrollArea className="sm:min-w-min sm:max-w-max md:min-h-[400px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead className="hidden py-4 md:table-cell sm:hidden">
                    Категория
                  </TableHead>
                  <TableHead className="hidden py-4 md:table-cell">
                    Производство
                  </TableHead>
                  <TableHead className="hidden py-4 sm:table-cell">
                    Вес
                  </TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Цена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithQuantity.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="hidden py-4 md:table-cell">
                      {getCategoryName(item.product.category_id)}
                    </TableCell>
                    <TableCell className="hidden py-4 md:table-cell">
                      {getFactoryName(item.factory_id)}
                    </TableCell>
                    <TableCell className="hidden py-4 sm:table-cell">
                      {item.product.weight} кг
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.product.price} ₽</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ScrollArea>
          </Table>
        </div>
        <Table className="text-sm sm:text-base text-wrap max-w-fit sm:min-w-full">
          <TableBody>
            <TableRow>
              <TableCell className="text-left font-bold">
                Общая стоимость товаров:
              </TableCell>
              <TableCell className="text-right font-bold">
                {totalProductsPrice.toFixed(2)} ₽
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-left font-bold">
                Стоимость доставки:
              </TableCell>
              <TableCell className="text-right font-bold">
                {deliveryCost.toFixed(2)} ₽
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-left font-bold">
                Общая стоимость заказа:
              </TableCell>
              <TableCell className="text-right font-bold">
                {totalPrice.toFixed(2)} ₽
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogFooter>
          <Button type="submit">Заказать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
