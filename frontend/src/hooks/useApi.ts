import axios from "axios";
import { useAuth } from "./useAuth";
import { useCallback } from "react";
import { API_URL } from "@/api/constants";

export interface ProductWithoutId {
  name: string;
  price: number;
  category: string;
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
  product_id: number;
  amount: number;
}

const PRODUCT_URL = `${API_URL}/product/`;
const PRODUCT_CATEGORY_URL = `${API_URL}/product_category/`;
const FACTORY_WAREHOUSE_URL = `${API_URL}/factory_warehouse/`;
const PRODUCT_COUNTS_URL = `product_counts/`;

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
        return await apiCall<Product>("post", PRODUCT_URL, newProduct);
      },
      token,
    ),
    [token],
  );

  const putProduct = useCallback(
    withTokenValidation(async (updatedProduct: Product): Promise<Product> => {
      return await apiCall<Product>(
        "put",
        `${PRODUCT_URL}${updatedProduct.id}/`,
        updatedProduct,
      );
    }, token),
    [token],
  );

  const deleteProduct = useCallback(
    withTokenValidation(async (productId: number): Promise<void> => {
      await apiCall<void>("delete", `${PRODUCT_URL}${productId}/`);
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
        return await apiCall<Category>(
          "post",
          PRODUCT_CATEGORY_URL,
          newCategory,
        );
      },
      token,
    ),
    [token],
  );

  const putCategory = useCallback(
    withTokenValidation(
      async (updatedCategory: Category): Promise<Category> => {
        return await apiCall<Category>(
          "put",
          `${PRODUCT_CATEGORY_URL}${updatedCategory.id}/`,
          updatedCategory,
        );
      },
      token,
    ),
    [token],
  );

  const deleteCategory = useCallback(
    withTokenValidation(async (categoryId: number): Promise<void> => {
      await apiCall<void>("delete", `${PRODUCT_CATEGORY_URL}${categoryId}/`);
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
  };
};
