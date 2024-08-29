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
import DeleteProduct from "@/components/ui/DeleteProduct";
import OrderProducts from "@/components/ui/OrderProducts";
import {
  Product,
  Category,
  ProductCount,
  useApi,
  ProductWithQuantity,
} from "@/hooks/useApi";
import { Skeleton } from "./skeleton";
import EditWarehouseProductCount from "./EditWarehouseProductCount";
import { Checkbox } from "./checkbox";
import OrderProductsDialog from "@/components/ui/OrderProducts";

export default function SalepointAvailableProductTable() {
  const { getProducts, getCategories, getProductsWithQuantity } = useApi();
  const [productsWithQuantity, setProductsWithQuantity] = useState<
    ProductWithQuantity[]
  >([]);
  const [productIdsSelected, setProductIdsSelected] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchProductsWithQuantity(), fetchCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error(`Error fetching data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsWithQuantity = useCallback(async () => {
    try {
      const productsWithQuantity: ProductWithQuantity[] =
        await getProductsWithQuantity();
      setProductsWithQuantity(productsWithQuantity);
    } catch (error) {
      console.error("Failed to fetch products with its quantity:", error);
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
  }, [fetchProductsWithQuantity, fetchCategories]);

  const findCategoryName = (category_id: number): string => {
    const categoryList = categories;
    // console.log("categoryList:", categoryList);
    const category = categoryList.find(
      (cat: Category) => cat.id === category_id,
    );
    console.log("category:", category);
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
          <TableHead className="py-4">
            <Skeleton className="h-6 w-[120px]" />
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
              <Skeleton className="h-6 w-[80px]" />
            </TableCell>
            <TableCell className="hidden py-4 md:table-cell">
              <Skeleton className="h-6 w-[80px]" />
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
          <CardDescription>Товары доступные для заказа</CardDescription>
        </CardHeader>
        <div className="ml-auto flex items-center gap-2 p-6">
          <Button size="sm" variant="outline" className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <OrderProductsDialog productsWithQuantity={productsWithQuantity} />

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
                <TableHead></TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead className="hidden md:table-cell">
                  Категория
                </TableHead>
                <TableHead className="hidden md:table-cell">Цена</TableHead>
                <TableHead className="hidden md:table-cell">Вес</TableHead>
                <TableHead className="hidden md:table-cell">
                  Количество на складе
                </TableHead>
                {/* <TableHead> */}
                {/*   <span className="sr-only">Действия</span> */}
                {/* </TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsWithQuantity.map(
                (productWithQuantity: ProductWithQuantity, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Checkbox
                          className="ym-auto"
                          checked={productIdsSelected.includes(
                            productWithQuantity.product.id,
                          )}
                          onCheckedChange={(checked) => {
                            checked
                              ? setProductIdsSelected([
                                  ...productIdsSelected,
                                  productWithQuantity.product.id,
                                ])
                              : setProductIdsSelected(
                                  productIdsSelected.filter(
                                    (item) =>
                                      item !== productWithQuantity.product.id,
                                  ),
                                );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {productWithQuantity.product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {findCategoryName(productWithQuantity.product.id)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₽{productWithQuantity.product.price}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {productWithQuantity.product.weight}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {productWithQuantity.amount}
                      </TableCell>
                      {/* <TableCell> */}
                      {/*   <DropdownMenu> */}
                      {/*     <DropdownMenuTrigger asChild> */}
                      {/*       <Button */}
                      {/*         aria-haspopup="true" */}
                      {/*         size="icon" */}
                      {/*         variant="ghost" */}
                      {/*       > */}
                      {/*         <MoreHorizontal className="h-4 w-4" /> */}
                      {/*         <span className="sr-only">Toggle menu</span> */}
                      {/*       </Button> */}
                      {/*     </DropdownMenuTrigger> */}
                      {/*     <DropdownMenuContent align="end"> */}
                      {/*       <DropdownMenuLabel>Действия</DropdownMenuLabel> */}
                      {/*       <div className="flex flex-col gap-1"> */}
                      {/*         <EditWarehouseProductCount */}
                      {/*           productCount={productCount} */}
                      {/*           onEditSuccess={fetchTableData} */}
                      {/*         /> */}
                      {/*         <DeleteProduct */}
                      {/*           productId={product.id} */}
                      {/*           onDeleteSuccess={fetchTableData} */}
                      {/*         /> */}
                      {/*       </div> */}
                      {/*     </DropdownMenuContent> */}
                      {/*   </DropdownMenu> */}
                      {/* </TableCell> */}
                    </TableRow>
                  );
                },
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {/* Показано товаров: <strong>{products.length}</strong> */}
        </div>
      </CardFooter>
    </Card>
  );
}
