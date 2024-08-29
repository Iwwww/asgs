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
import EditProduct from "@/components/ui/EditProduct";
import DeleteProduct from "@/components/ui/DeleteProduct";
import { Product, Category, useApi } from "@/hooks/useApi";
import AddProduct from "./AddProduct";
import { Skeleton } from "./skeleton";

export default function ProductsTable() {
  const { getProducts, getCategories, postProduct } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, [getProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [getCategories]);

  useEffect(() => {
    fetchTableData();
  }, [fetchProducts, fetchCategories]);

  const findCategoryName = (category_id: number): string => {
    const categoryList = categories;
    const category = categoryList.find((cat) => cat.id === category_id);
    return category ? category.name : "Unknown Category";
  };

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-4">
            <Skeleton className="h-6 w-[120px]" />
          </TableHead>
          <TableHead className="hidden py-4 md:table-cell">
            <Skeleton className="h-6 w-[100px]" />
          </TableHead>
          <TableHead className="hidden py-4 md:table-cell">
            <Skeleton className="h-6 w-[80px]" />
          </TableHead>
          <TableHead className="hidden py-4 md:table-cell">
            <Skeleton className="h-6 w-[80px]" />
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
              <Skeleton className="h-6 w-[120px]" />
            </TableCell>
            <TableCell className="hidden py-4 md:table-cell">
              <Skeleton className="h-6 w-[100px]" />
            </TableCell>
            <TableCell className="hidden py-4 md:table-cell">
              <Skeleton className="h-6 w-[80px]" />
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
          <CardTitle>Товары</CardTitle>
          <CardDescription>Управление товарами</CardDescription>
        </CardHeader>
        <div className="ml-auto flex items-center gap-2 p-6">
          <Button size="sm" variant="outline" className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddProduct categories={categories} onAddSuccess={fetchTableData} />
          <Button
            onClick={fetchTableData}
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
                <TableHead className="hidden md:table-cell">
                  Категория
                </TableHead>
                <TableHead className="hidden md:table-cell">Цена</TableHead>
                <TableHead className="hidden md:table-cell">Вес</TableHead>
                <TableHead>
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {findCategoryName(product.category_id)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ₽{product.price}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.weight}
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
                          <EditProduct
                            product={product}
                            categories={categories}
                            onEditSuccess={fetchTableData}
                          />
                          <DeleteProduct
                            productId={product.id}
                            onDeleteSuccess={fetchTableData}
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
          Показано товаров: <strong>{products.length}</strong>
        </div>
      </CardFooter>
    </Card>
  );
}
