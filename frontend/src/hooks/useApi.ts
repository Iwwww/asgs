import axios from "axios";
import { useAuth } from "./useAuth";
import { useCallback } from "react";
import {
  FACTORY_WAREHOUSE_URL,
  PRODUCTS_WITH_QUANTITY_URL,
  PRODUCT_CATEGORY_URL,
  PRODUCT_COUNTS_URL,
  PRODUCT_URL,
  SALEPOINT_AVAILABLE_PRODUCTS_URL,
} from "@/api/constants";

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

interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CategoryWithoutId {
  name: string;
  description: string;
}

export interface Category extends CategoryWithoutId {
  id: number;
}

interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface ProductCount {
  product: number;
  amount: number;
}

export interface OrderProducts {
  products_id: number[];
}

export interface ProductWithQuantity {
  product: Product;
  factory_id: number;
  amount: number;
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
    method: "get" | "post" | "put" | "delete",
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
    getProductsWithQuantity,
  };
};
