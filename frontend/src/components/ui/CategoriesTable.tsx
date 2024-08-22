import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { File, MoreHorizontal, RefreshCw } from "lucide-react";
import EditCategory from "@/components/ui/EditCategory";
import DeleteCategory from "@/components/ui/DeleteCategory";
import { Category, useApi } from "@/hooks/useApi";
import AddCategory from "./AddCategory";
import { Skeleton } from "./skeleton";

export default function CategoriesTable() {
  const { getCategories, postCategory } = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-4">
            <Skeleton className="h-6 w-[120px]" />
          </TableHead>
          <TableHead className="hidden py-4 md:table-cell">
            <Skeleton className="h-6 w-[200px]" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index} className="border-b border-gray-200">
            <TableCell className="py-4">
              <Skeleton className="h-6 w-[180px]" />
            </TableCell>
            <TableCell className="hidden py-4 md:table-cell">
              <Skeleton className="h-6 w-[200px]" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-6 w-10 md:table-cell" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <div className="flex items-center">
        <CardHeader>
          <CardTitle>Категории</CardTitle>
          <CardDescription>Управление категориями</CardDescription>
        </CardHeader>
        <div className="ml-auto flex items-center gap-2 p-6">
          <Button size="sm" variant="outline" className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddCategory
            addCategory={postCategory}
            onAddSuccess={fetchCategories}
          />
          <Button
            onClick={fetchCategories}
            disabled={isLoading}
            size="sm"
            aria-label="Reload data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Наименование</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
                <TableHead>
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: Category, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <div className="flex flex-col gap-1">
                          <EditCategory
                            category={category}
                            onEditSuccess={fetchCategories}
                          />
                          <DeleteCategory
                            categoryId={category.id}
                            onDeleteSuccess={fetchCategories}
                          />
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Показано категорий: <strong>{categories.length}</strong>
        </div>
      </CardFooter>
    </Card>
  );
}
