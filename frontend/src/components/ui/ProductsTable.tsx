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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import EditProduct from "@/components/ui/EditProduct";
import DeleteProduct from "@/components/ui/DeleteProduct";
import { Product, Category, useApi } from "@/hooks/useApi";

interface ProductsTableProps {
  categories?: Category[];
}

export default function ProductsTable({ categories }: ProductsTableProps) {
  const { getProducts, getCategories } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [getProducts]);

  const fetchCategoriesIfNeeded = useCallback(async () => {
    if (!categories) {
      try {
        const categoriesData = await getCategories();
        setFetchedCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
  }, [categories, getCategories]);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesIfNeeded();
  }, [fetchProducts, fetchCategoriesIfNeeded]);

  const findCategoryName = (categoryUrl: string): string => {
    const categoryList = categories || fetchedCategories; // Use provided categories or fetched ones
    const category = categoryList.find(
      (cat) => cat.id === extractIdFromUrl(categoryUrl),
    );
    return category ? category.name : "Unknown Category";
  };

  const extractIdFromUrl = (url: string): number => {
    const parts = url.split("/");
    return parseInt(parts[parts.length - 2], 10);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Товары</CardTitle>
        <CardDescription>Управление товарами</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
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
                    {findCategoryName(product.category)}
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
                            categories={categories || fetchedCategories}
                          />
                          <DeleteProduct productId={product.id} />
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
          Показано <strong>{products.length}</strong> продукта
        </div>
      </CardFooter>
    </Card>
  );
}
