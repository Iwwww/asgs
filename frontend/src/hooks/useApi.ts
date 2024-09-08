import axios from "axios";
import { useAuth } from "./useAuth";
import { useCallback } from "react";
import {
  FACTORIE_URL,
  FACTORY_WAREHOUSE_URL,
  PRODUCT_ORDER_URL,
  PRODUCTS_WITH_QUANTITY_URL,
  PRODUCT_CATEGORY_URL,
  PRODUCT_COUNTS_URL,
  PRODUCT_URL,
  SALEPOINT_AVAILABLE_PRODUCTS_URL,
  SALEPOINT_URL,
  UPDATE_ORDERS_STATUS_URL,
} from "@/api/constants";

interface ListResponseHeader {
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ProductWithoutId {
  name: string;
  price: number;
  category_id: number;
  weight: number;
  description: string;
}

export interface Product extends ProductWithoutId {
  id: number;
}

interface ProductResponse extends ListResponseHeader {
  results: Product[];
}

export interface CategoryWithoutId {
  name: string;
  description: string;
}

export interface Category extends CategoryWithoutId {
  id: number;
}

interface CategoryResponse extends ListResponseHeader {
  results: Category[];
}

export interface ProductCount {
  product: number;
  quantity: number;
}

export interface ProductOrder {
  product_id: number;
  quantity: number;
}

export interface ProductWithQuantity {
  product: Product;
  factory_id: number;
  quantity: number;
}

export interface Factory {
  id: number;
  name: string;
  address: string;
}

interface FactoryResponse extends ListResponseHeader {
  results: Factory[];
}

export interface OrderStatus {
  id: number;
  status: string;
}

export interface Order extends OrderStatus {
  product_id: number;
  quantity: number;
  order_date: string;
  factory_id: number;
  sale_point_id: number;
}

export interface Salepoint {
  id: number;
  name: string;
  address: string;
}

interface SalepointsResponse extends ListResponseHeader {
  results: Salepoint[];
}

interface OrdersResponse extends ListResponseHeader {
  results: Order[];
}

interface patchOrdersStatusResponse {
  updated_orders: number;
  status: string;
}

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Token ${token}`,
  },
});

const handleApiError = (error: any): never => {
  if (error.response?.status === 403) {
    throw new Error(
      "Доступ запрещён: недостаточно прав для выполнения этого действия.",
    );
  }
  console.error("API Error:", error.response?.data || error.message);
  throw error;
};

const withTokenValidation = <T extends (...args: any[]) => any>(
  fn: T,
  token: string | null,
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!token) throw new Error("No authentication token found");
    return fn(...args);
  };
};

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = async <T>(
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    data?: any,
  ): Promise<T> => {
    try {
      const response = await axios({
        method,
        url,
        data,
        ...getAuthHeaders(token!),
      });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
    return undefined as never;
  };

  const getProducts = useCallback(
    withTokenValidation(async (): Promise<Product[]> => {
      const response = await apiCall<ProductResponse>("get", PRODUCT_URL);
      return response.results;
    }, token),
    [token],
  );

  const postProduct = useCallback(
    withTokenValidation(
      async (newProduct: ProductWithoutId): Promise<Product> => {
        const response = await apiCall<Product>(
          "post",
          PRODUCT_URL,
          newProduct,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const putProduct = useCallback(
    withTokenValidation(async (updatedProduct: Product): Promise<Product> => {
      const response = await apiCall<Product>(
        "put",
        `${PRODUCT_URL}${updatedProduct.id}/`,
        updatedProduct,
      );
      return response;
    }, token),
    [token],
  );

  const deleteProduct = useCallback(
    withTokenValidation(async (productId: number): Promise<void> => {
      const response = await apiCall<void>(
        "delete",
        `${PRODUCT_URL}${productId}/`,
      );
      return response;
    }, token),
    [token],
  );

  const getCategories = useCallback(
    withTokenValidation(async (): Promise<Category[]> => {
      const response = await apiCall<CategoryResponse>(
        "get",
        PRODUCT_CATEGORY_URL,
      );
      return response.results;
    }, token),
    [token],
  );

  const postCategory = useCallback(
    withTokenValidation(
      async (newCategory: CategoryWithoutId): Promise<Category> => {
        const response = await apiCall<Category>(
          "post",
          PRODUCT_CATEGORY_URL,
          newCategory,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const putCategory = useCallback(
    withTokenValidation(
      async (updatedCategory: Category): Promise<Category> => {
        const response = await apiCall<Category>(
          "put",
          `${PRODUCT_CATEGORY_URL}${updatedCategory.id}/`,
          updatedCategory,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const deleteCategory = useCallback(
    withTokenValidation(async (categoryId: number): Promise<void> => {
      const response = await apiCall<void>(
        "delete",
        `${PRODUCT_CATEGORY_URL}${categoryId}/`,
      );
      return response;
    }, token),
    [token],
  );

  const getWarehouseProductCounts = useCallback(
    withTokenValidation(async (): Promise<ProductCount[]> => {
      const response = await apiCall<ProductCount[]>(
        "get",
        `${FACTORY_WAREHOUSE_URL + PRODUCT_COUNTS_URL}`,
      );
      return response;
    }, token),
    [token],
  );

  const postWarehouseProductCount = useCallback(
    withTokenValidation(
      async (newProductCounts: ProductCount[]): Promise<ProductCount[]> => {
        const response = await apiCall<ProductCount[]>(
          "post",
          `${FACTORY_WAREHOUSE_URL + PRODUCT_COUNTS_URL}`,
          newProductCounts,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const putWarehouseProductCount = useCallback(
    withTokenValidation(
      async (newProductCounts: ProductCount[]): Promise<ProductCount> => {
        const response = await apiCall<ProductCount>(
          "put",
          `${FACTORY_WAREHOUSE_URL + PRODUCT_COUNTS_URL}`,
          newProductCounts,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const deleteWarehouseProductCount = useCallback(
    withTokenValidation(async (productId: number): Promise<ProductCount> => {
      const response = await apiCall<ProductCount>(
        "delete",
        `${FACTORY_WAREHOUSE_URL + PRODUCT_COUNTS_URL}`,
        productId,
      );
      return response;
    }, token),
    [token],
  );

  const getSalepointAvailableProducts = useCallback(
    withTokenValidation(async (): Promise<ProductResponse[]> => {
      const response = await apiCall<ProductResponse[]>(
        "get",
        `${SALEPOINT_AVAILABLE_PRODUCTS_URL}`,
      );
      return response;
    }, token),
    [token],
  );

  const getProductsWithQuantity = useCallback(
    withTokenValidation(async (): Promise<ProductWithQuantity[]> => {
      const response = await apiCall<ProductWithQuantity[]>(
        "get",
        `${PRODUCTS_WITH_QUANTITY_URL}`,
      );
      return response;
    }, token),
    [token],
  );

  const getFactories = useCallback(
    withTokenValidation(async (): Promise<Factory[]> => {
      const response: FactoryResponse = await apiCall<FactoryResponse>(
        "get",
        `${FACTORIE_URL}`,
      );
      return response.results;
    }, token),
    [token],
  );

  const postOrderProducts = useCallback(
    withTokenValidation(
      async (productsOrder: ProductOrder[]): Promise<ProductOrder[]> => {
        const response = await apiCall<ProductOrder[]>(
          "post",
          `${PRODUCT_ORDER_URL}`,
          productsOrder,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  const getOrders = useCallback(
    withTokenValidation(async (): Promise<Order[]> => {
      const response: OrdersResponse = await apiCall<OrdersResponse>(
        "get",
        `${PRODUCT_ORDER_URL}`,
      );
      return response.results;
    }, token),
    [token],
  );

  const getSalepoints = useCallback(
    withTokenValidation(async (): Promise<Salepoint[]> => {
      const response: SalepointsResponse = await apiCall<SalepointsResponse>(
        "get",
        `${SALEPOINT_URL}`,
      );
      return response.results;
    }, token),
    [token],
  );

  const patchOrdersStatus = useCallback(
    withTokenValidation(
      async (
        ordersStatus: OrderStatus[],
      ): Promise<patchOrdersStatusResponse> => {
        const response = await apiCall<patchOrdersStatusResponse>(
          "patch",
          `${UPDATE_ORDERS_STATUS_URL}`,
          ordersStatus,
        );
        return response;
      },
      token,
    ),
    [token],
  );

  return {
    getProducts,
    postProduct,
    putProduct,
    deleteProduct,
    getCategories,
    postCategory,
    putCategory,
    deleteCategory,
    getWarehouseProductCounts,
    postWarehouseProductCount,
    putWarehouseProductCount,
    deleteWarehouseProductCount,
    getSalepointAvailableProducts,
    getProductsWithQuantity,
    getFactories,
    postOrderProducts,
    getOrders,
    getSalepoints,
    patchOrdersStatus,
  };
};
