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
  results: Product[];
}

/* TODO:
  - [x] fetch all products
  - [x] get categories
  - [ ] product info
  - [ ] fetch products in warehouse
  - [x] add product
  - [x] update product
  - [?] update product permission denay handle
*/
export const useApi = () => {
  const { token } = useAuth();

  const getProducts = useCallback(async (): Promise<Product[]> => {
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get<ProductResponse>(`${API_URL}/product/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data.results;
    } catch (error: any) {
      console.error(
        "Error fetching products:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }, [token]);

  const putProduct = useCallback(
    async (newProduct: Product): Promise<Product> => {
      if (!token) throw new Error("No authentication token found");

      try {
        const response = await axios.put<Product>(
          `${API_URL}/product/${newProduct.id}/`,
          newProduct,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Error put product:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  const postProduct = useCallback(
    async (newProduct: ProductWithoutId): Promise<Product> => {
      if (!token) throw new Error("No authentication token found");

      try {
        const response = await axios.post<Product>(
          `${API_URL}/product/`,
          newProduct,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Error post product:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  const deleteProduct = useCallback(
    async (productId: number): Promise<Product> => {
      if (!token) throw new Error("No authentication token found");

      try {
        const response = await axios.delete<Product>(
          `${API_URL}/product/${productId}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Error delete product:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  const getCategories = useCallback(async (): Promise<Category[]> => {
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<CategoryResponse>(
        `${API_URL}/product_category/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      return response.data.results;
    } catch (error: any) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }, [token]);

  const postCategory = useCallback(
    async (newCategory: CategoryWithoutId): Promise<Category> => {
      if (!token) throw new Error("No authentication token found");

      try {
        const response = await axios.post<Category>(
          `${API_URL}/product_category/`,
          newCategory,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Error posting category:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  const putCategory = useCallback(
    async (updatedCategory: Category): Promise<Category> => {
      if (!token) throw new Error("No authentication token found");
      try {
        const response = await axios.put<Category>(
          `${API_URL}/product_category/${updatedCategory.id}/`,
          updatedCategory,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Error putting category:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  const deleteCategory = useCallback(
    async (categoryId: number): Promise<void> => {
      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        await axios.delete<void>(`${API_URL}/product_category/${categoryId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } catch (error: any) {
        console.error(
          "Error deleting category:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    [token],
  );

  return {
    getProducts,
    putProduct,
    postProduct,
    deleteProduct,
    getCategories,
    postCategory,
    putCategory,
    deleteCategory,
  };
};
