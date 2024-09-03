"use client";

import { useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, PlusCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { Product, Category, ProductCount } from "@/hooks/useApi";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuantitySelector from "./QuantitySelector";

interface AddProductToWarehouseProps {
  products: Product[];
  categories: Category[];
  postProductToWarehouse: (
    newProductCounts: ProductCount[],
  ) => Promise<Promise<ProductCount[]>>;
  onAddSuccess?: () => void;
}

export default function AddProductToWarehouse({
  products,
  categories,
  postProductToWarehouse,
  onAddSuccess,
}: AddProductToWarehouseProps) {
  const [openProduct, setOpenProduct] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) {
      return products;
    }
    return products.filter((product) => {
      const productCategoryId = parseInt(
        product.category.split("/").slice(-2)[0],
      );
      return selectedCategories.includes(productCategoryId);
    });
  }, [products, selectedCategories]);

  const isFormValid = useMemo(() => {
    return selectedProduct !== null && quantity > 0;
  }, [selectedProduct, quantity]);

  const handleSave = useCallback(async () => {
    if (selectedProduct === null) return;

    try {
      await postProductToWarehouse([
        { product: selectedProduct, quantity: quantity },
      ]);
      console.log("selectedProduct:", selectedProduct);
      console.log("quantity:", quantity);
      toast({
        title: "Товар добавлен на склад",
        description: "Товар успешно добавлен на склад.",
      });

      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении товара на склад.",
        variant: "destructive",
      });
      console.error("Ошибка при добавлении товара на склад:", error);
    }
  }, [selectedProduct, quantity, postProductToWarehouse, toast, onAddSuccess]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Добавить товар на склад
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Добавление товара на склад</SheetTitle>
          <SheetDescription>
            Выберите категории, товар, затем укажите количество для добавления
            на склад. Когда закончите, нажмите "Добавить".
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categories" className="text-right">
              Категории
            </Label>
            <Popover open={openCategories} onOpenChange={setOpenCategories}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategories}
                  className="col-span-3 justify-between"
                >
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} выбрано`
                    : "Выберите категории..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск категории..." />
                  <CommandList>
                    <CommandEmpty>Категория не найдена.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          onSelect={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(category.id)
                                ? prev.filter((id) => id !== category.id)
                                : [...prev, category.id],
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            className="mr-2"
                          />
                          <span className="flex-1">{category.name}</span>
                          {category.description ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{category.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            ""
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Товар
            </Label>
            <Popover open={openProduct} onOpenChange={setOpenProduct}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProduct}
                  className="col-span-3 justify-between"
                >
                  {selectedProduct !== null
                    ? products.find((product) => product.id === selectedProduct)
                        ?.name
                    : "Выберите товар..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск товара..." />
                  <CommandList>
                    <CommandEmpty>Товар не найден.</CommandEmpty>
                    <CommandGroup>
                      {filteredProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.id.toString()}
                          onSelect={(currentValue) => {
                            setSelectedProduct(
                              Number(currentValue) === selectedProduct
                                ? null
                                : Number(currentValue),
                            );
                            setOpenProduct(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProduct === product.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex-1">{product.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="grid gap-2">
                                  <p>
                                    <strong>Цена:</strong> {product.price} ₽
                                  </p>
                                  <p>
                                    <strong>Вес:</strong> {product.weight} кг
                                  </p>
                                  {product.description ? (
                                    <p>
                                      <strong>Описание:</strong>{" "}
                                      {product.description}
                                    </p>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Количество
            </Label>
            <QuantitySelector
              onValueChange={(e) => {
                setQuantity(e || 0);
                console.log(e);
              }}
              min={1}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSave} disabled={!isFormValid}>
              Добавить
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
