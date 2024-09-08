"use client";

import { parseISO, format } from "date-fns";
import { ru } from "date-fns/locale";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { File, MoreHorizontal, RefreshCw } from "lucide-react";
import {
  Product,
  Category,
  useApi,
  Order,
  Factory,
  OrderStatus,
} from "@/hooks/useApi";
import AddProduct from "./AddProduct";
import { Skeleton } from "./skeleton";
import { StatusComboboxPopover } from "./StatusComboboxPopover";

const STATUS_CHOICES: { [key: string]: string } = {
  in_processing: "В обработке",
  delivery: "Доставляется",
  delivered: "Доставлен",
};

export default function CarrierOrdersTable() {
  const {
    getProducts,
    getCategories,
    getOrders,
    getFactories,
    getSalepoints,
    patchOrdersStatus,
  } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [salepoints, setSalepoints] = useState<Factory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchFactories(),
        fetchCategories(),
        fetchSalepoints(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [getOrders]);

  const fetchFactories = useCallback(async () => {
    try {
      const factoriesData = await getFactories();
      setFactories(factoriesData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [getFactories]);

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

  const fetchSalepoints = useCallback(async () => {
    try {
      const salepointsData = await getSalepoints();
      setSalepoints(salepointsData);
    } catch (error) {
      console.error("Failed to fetch salepoints:", error);
    }
  }, [getCategories]);

  useEffect(() => {
    fetchTableData();
    setIsLoading(false);
  }, [fetchOrders]);

  const handleRowSelect = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    setSelectedOrders((prev) =>
      prev.length === orders.length ? [] : orders.map((order) => order.id),
    );
  };

  // const handleStatusChange = async (orderId: number, newStatus: string) => {
  //   try {
  //     await updateOrderStatus(orderId, newStatus);
  //     await fetchOrders();
  //   } catch (error) {
  //     console.error("Failed to update order status:", error);
  //   }
  // };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const newOrdersStatus: OrderStatus[] = selectedOrders.map(
        (order: number) => ({ id: order, status: newStatus }),
      );
      await Promise.all(patchOrdersStatus(newOrdersStatus));
      await fetchOrders();
      setSelectedOrders([]);
    } catch (error) {
      console.error("Failed to update order statuses:", error);
    }
  };

  const getProduct = (product_id: number): Product | undefined => {
    const product: Product | undefined = products.find(
      (prod: Product) => prod.id === product_id,
    );
    return product;
  };

  const getProductName = (product_id: number): string => {
    const product: Product | undefined = getProduct(product_id);
    return product ? product.name : "Неизвестный товар";
  };

  const getOrderWeight = (product_id: number, quantity: number): string => {
    const product: Product | undefined = getProduct(product_id);
    return product ? (product.weight * quantity).toString() + " кг" : "N/A";
  };

  const salepointName = (salepoint_id: number): string => {
    const salepoint = salepoints.find((sp) => sp.id === salepoint_id);
    return salepoint ? salepoint.name : "Неизвестно";
  };

  const factoryName = (factory_id: number): string => {
    const factory = factories.find((fact) => fact.id === factory_id);
    return factory ? factory.name : "Неизвестное производство";
  };

  const parseDate = (dateString: string): string => {
    const date = parseISO(dateString);
    return format(date, "d MMMM yyyy", { locale: ru });
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
          <CardTitle>Заказы</CardTitle>
          <CardDescription>Управление заказами</CardDescription>
        </CardHeader>
        <div className="ml-auto flex items-center gap-2 p-6">
          <StatusComboboxPopover
            selectedOrders={selectedOrders}
            onStatusChange={handleBulkStatusChange}
          />
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
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Товар</TableHead>
                <TableHead className="hidden md:table-cell">
                  Торговая точка
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Производство
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Общий вес
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Количество
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Дата заказа
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Стоимость доставки
                </TableHead>
                <TableHead className="hidden md:table-cell">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Order, index: number) => (
                <TableRow
                  key={index}
                  className={
                    selectedOrders.includes(order.id) ? "bg-muted" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleRowSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getProductName(order.product_id)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {salepointName(order.sale_point_id)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {factoryName(order.factory_id)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getOrderWeight(order.product_id, order.quantity)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.quantity}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {parseDate(order.order_date)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">₽?</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {STATUS_CHOICES[order.status]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Показано заказов: <strong>{orders.length}</strong>, Выбрано:{" "}
          <strong>{selectedOrders.length}</strong>
        </div>
      </CardFooter>
    </Card>
  );
}
