import { useState, useEffect, useCallback, useMemo } from "react";
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
import { File, RefreshCw } from "lucide-react";
import { Category, useApi, ProductWithQuantity } from "@/hooks/useApi";
import { Skeleton } from "./skeleton";
import OrderProductsDialog from "@/components/ui/OrderProductsDialog";
import QuantitySelector from "./QuantitySelector";

interface ProductWithQuantityWithSelection extends ProductWithQuantity {
  selectedValue: number;
}

interface State {
  productsWithQuantity: ProductWithQuantityWithSelection[];
  categories: Category[];
  isLoading: boolean;
}

export default function SalepointAvailableProductTable() {
  const { getCategories, getProductsWithQuantity } = useApi();

  const [state, setState] = useState<State>({
    productsWithQuantity: [],
    categories: [],
    isLoading: true,
  });

  const fetchTableData = useCallback(async () => {
    setState((prevState) => ({ ...prevState, isLoading: true }));

    try {
      const [productsWithQuantity, categories] = await Promise.all([
        getProductsWithQuantity(),
        getCategories(),
      ]);

      const productsWithQuantitySelected = productsWithQuantity.map((item) => ({
        ...item,
        selectedValue: 0,
      }));

      setState({
        productsWithQuantity: productsWithQuantitySelected,
        categories,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, [getProductsWithQuantity, getCategories]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const findCategoryName = useCallback(
    (categoryId: number): string => {
      const category = state.categories.find((cat) => cat.id === categoryId);
      return category ? category.name : "Unknown Category";
    },
    [state.categories],
  );

  const orderData = useMemo((): ProductWithQuantity[] => {
    return state.productsWithQuantity
      .filter((item) => item.selectedValue > 0)
      .map((item) => ({
        ...item,
        amount: item.selectedValue,
      }));
  }, [state.productsWithQuantity]);

  const handleQuantityChange = useCallback(
    (productId: number, newValue: number) => {
      setState((prevState) => ({
        ...prevState,
        productsWithQuantity: prevState.productsWithQuantity.map((item) =>
          item.product.id === productId
            ? { ...item, selectedValue: newValue }
            : item,
        ),
      }));
    },
    [],
  );

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(6)].map((_, idx) => (
            <TableHead key={idx} className="py-4">
              <Skeleton className={`h-6 ${idx === 0 ? "w-6" : "w-[120px]"}`} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index} className="border-b border-gray-200">
            {[...Array(6)].map((_, idx) => (
              <TableCell key={idx} className="py-4">
                <Skeleton className={`h-6 ${idx === 0 ? "w-6" : "w-[80px]"}`} />
              </TableCell>
            ))}
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
          <OrderProductsDialog
            productsWithQuantity={orderData}
            onOrderProductsSuccess={fetchTableData}
          />
          <Button
            onClick={fetchTableData}
            disabled={state.isLoading}
            size="sm"
            aria-label="Reload data"
          >
            <RefreshCw
              className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
      <CardContent>
        {state.isLoading ? (
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
                <TableHead className="hidden md:table-cell">
                  Количество на складе
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Выбрано количество
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.productsWithQuantity.map((productWithQuantity, index) => (
                <TableRow key={index}>
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
                  <TableCell className="hidden md:table-cell">
                    <QuantitySelector
                      max={productWithQuantity.amount}
                      onValueChange={(newValue) =>
                        handleQuantityChange(
                          productWithQuantity.product.id,
                          newValue,
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {/* Показано товаров: <strong>{state.productsWithQuantity.length}</strong> */}
        </div>
      </CardFooter>
    </Card>
  );
}
