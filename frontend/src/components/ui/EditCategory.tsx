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
import { Category, useApi } from "@/hooks/useApi";
import { useCallback, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EditCategoryProps {
  category: Category;
  onEditSuccess?: () => void;
}

export default function EditCategory({
  category,
  onEditSuccess,
}: EditCategoryProps) {
  const [name, setName] = useState<string>(category.name);
  const [description, setDescription] = useState<string>(category.description);
  const { putCategory } = useApi();
  const { toast } = useToast();

  const isFormValid = useMemo(() => {
    return name.trim() !== "";
  }, [name]);

  const handleEdit = useCallback(async () => {
    const updatedCategory: Category = {
      id: category.id,
      name: name,
      description: description,
    };

    try {
      const result = await putCategory(updatedCategory);
      toast({
        title: "Категория обновлена",
        description: "Информация о категории успешно обновлена.",
      });

      if (onEditSuccess) {
        onEditSuccess();
      }

      console.log("Категория успешно обновлена:", result);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении категории.",
        variant: "destructive",
      });
      console.error("Ошибка при обновлении категории:", error);
    }
  }, [category.id, name, description, putCategory, toast, onEditSuccess]);

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
          <SheetTitle>Изменение категории</SheetTitle>
          <SheetDescription>
            Внесите изменения в информацию о категории. Когда закончите, нажмите
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
