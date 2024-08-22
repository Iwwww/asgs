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
import { Textarea } from "@/components/ui/textarea";
import { CategoryWithoutId, Category } from "@/hooks/useApi";
import { useState, useCallback, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddCategoryProps {
  addCategory: (newCategory: CategoryWithoutId) => Promise<Category>;
  onAddSuccess?: () => void;
}

export default function AddCategory({
  addCategory,
  onAddSuccess,
}: AddCategoryProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const isFormValid = useMemo(() => {
    return name.trim() !== "";
  }, [name]);

  const handleSave = useCallback(async () => {
    const newCategory: CategoryWithoutId = {
      name: name,
      description: description,
    };

    try {
      await addCategory(newCategory);
      toast({
        title: "Категория добавлена",
        description: "Новая категория успешно добавлена.",
      });

      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении категории.",
        variant: "destructive",
      });
      console.error("Ошибка при добавлении категории:", error);
    }
  }, [name, description, addCategory, toast, onAddSuccess]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Добавить категорию
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Добавление категории</SheetTitle>
          <SheetDescription>
            Заполните информацию о новой категории. Когда закончите, нажмите
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
