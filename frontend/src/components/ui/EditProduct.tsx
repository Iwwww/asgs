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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category, Product, useApi } from "@/hooks/useApi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PRODUCT_CATEGORY_URL } from "@/api/constants";

interface EditProductProps {
  product: Product;
  categories: Category[];
  onEditSuccess?: () => void;
}

export default function EditProduct({
  product,
  categories,
  onEditSuccess,
}: EditProductProps) {
  const [name, setName] = useState<string>(product.name);
  const [price, setPrice] = useState<number>(product.price);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [weight, setWeight] = useState<number>(product.weight);
  const [description, setDescription] = useState<string>(product.description);
  const { putProduct } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    const categoryId = product.category.split("/").filter(Boolean).pop();
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    console.log("Категория найдена:", categoryId);
  }, [product.category, categories]);

  const isFormValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      price > 0 &&
      selectedCategory.trim() !== "" &&
      weight > 0
    );
  }, [name, price, selectedCategory, weight]);

  const handleEdit = useCallback(async () => {
    const newProduct: Product = {
      id: product.id,
      name: name,
      price: price,
      category: `${PRODUCT_CATEGORY_URL + selectedCategory}/`,
      weight: weight,
      description: description,
    };

    try {
      const updatedProduct = await putProduct(newProduct);
      toast({
        title: "Товар обновлён",
        description: "Информация о товаре успешно обновлена.",
      });

      if (onEditSuccess) {
        onEditSuccess();
      }

      console.log("Товар успешно обновлён:", updatedProduct);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении товара.",
        variant: "destructive",
      });
      console.error("Ошибка при обновлении товара:", error);
    }
  }, [
    product.id,
    name,
    price,
    selectedCategory,
    weight,
    description,
    putProduct,
    toast,
    onEditSuccess,
  ]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8">
          <Edit className="h-4 w-4" />
          Изменить
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Изменение товара</SheetTitle>
          <SheetDescription>
            Внесите изменения в информацию о товаре. Когда закончите, нажмите
            "Сохранить".
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Наименование
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Цена, ₽
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Категория
            </Label>
            <Select
              id="category"
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите категорию">
                  {selectedCategory
                    ? categories.find(
                        (cat) => cat.id.toString() === selectedCategory,
                      )?.name
                    : "Выберите категорию"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Вес, кг
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Описание
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
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
