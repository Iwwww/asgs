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
import { useCallback, useEffect, useState } from "react";
import { Edit } from "lucide-react";

interface EditProductProps {
  product: Product;
  categories: Category[];
}

export default function EditProduct({ product, categories }: EditProductProps) {
  const [name, setName] = useState<string>(product.name);
  const [price, setPrice] = useState<number>(product.price);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [weight, setWeight] = useState<number>(product.weight);
  const [description, setDescription] = useState<string>(product.description);
  const { putProduct } = useApi();

  useEffect(() => {
    const categoryId = product.category.split("/").filter(Boolean).pop();
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    console.log("Category found:", categoryId);
  }, [product.category, categories]);

  const handleSave = useCallback(async () => {
    const newProduct: Product = {
      id: product.id,
      name: name,
      price: price,
      category: `http://localhost:8000/product_category/${selectedCategory}/`, // Form correct category URL
      weight: weight,
      description: description,
    };

    try {
      const updatedProduct = await putProduct(newProduct);
      console.log("Product updated successfully:", updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  }, [
    product.id,
    name,
    price,
    selectedCategory,
    weight,
    description,
    putProduct,
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
            Внесите изменения в информацию о продукте. Когда закончите, нажмите
            сохранить.
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
            <Button type="submit" onClick={handleSave}>
              Сохранить изменения
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
