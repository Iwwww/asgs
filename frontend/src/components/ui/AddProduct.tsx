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
import { Category, Product, ProductWithoutId } from "@/hooks/useApi";
import { useState, useCallback, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { API_URL } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";

interface AddProductProps {
  categories: Category[];
  addProduct: (newProduct: ProductWithoutId) => Promise<Product>;
  onAddSuccess?: () => void;
}

export default function AddProduct({
  categories,
  addProduct,
  onAddSuccess,
}: AddProductProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [weight, setWeight] = useState(0);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const isFormValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      price > 0 &&
      selectedCategory.trim() !== "" &&
      weight > 0
    );
  }, [name, price, selectedCategory, weight]);

  const handleSave = useCallback(async () => {
    const newProduct: ProductWithoutId = {
      name: name,
      price: price,
      category: `${API_URL}/product_category/${selectedCategory}/`,
      weight: weight,
      description: description,
    };

    try {
      await addProduct(newProduct);
      toast({
        title: "Товар добавлен",
        description: "Новый товар успешно добавлен.",
      });

      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении товара.",
        variant: "destructive",
      });
      console.error("Ошибка при добавлении товара:", error);
    }
  }, [
    name,
    price,
    selectedCategory,
    weight,
    description,
    addProduct,
    toast,
    onAddSuccess,
  ]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Добавить товар
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Добавление товара</SheetTitle>
          <SheetDescription>
            Заполните информацию о новом товаре. Когда закончите, нажмите
            "Добавить".
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
              className="col-span-3"
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
            <Button type="submit" onClick={handleSave} disabled={!isFormValid}>
              Добавить
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
