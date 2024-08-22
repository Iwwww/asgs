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
import { File, MoreHorizontal } from "lucide-react";
import EditProduct from "@/components/ui/EditProduct";
import DeleteProduct from "@/components/ui/DeleteProduct";
import { Product, Category, useApi } from "@/hooks/useApi";
import AddProduct from "./AddProduct";

export default function ProductsTable() {
  const { getProducts, getCategories, postProduct } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const onProductChange = async () => {
    fetchProducts();
    fetchCategories();
  };

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

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [getCategories]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const findCategoryName = (categoryUrl: string): string => {
    const categoryList = categories;
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
          <AddProduct categories={categories} addProduct={postProduct} />
        </div>
      </div>
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
                            categories={categories || categories}
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
