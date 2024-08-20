import axios from "axios";
import { useAuth } from "./useAuth";
import { useCallback } from "react";

const API_URL = "http://localhost:8000";

export interface Product {
  name: string;
  price: number;
  category: string;
  weight: number;
  description: string;
}

interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

/* TODO:
  - [x] fetch all products
  - [x] get category
  - [ ] product info
  - [ ] fetch products in warehouse
  - [ ] add product
  - [ ] update product
*/
export const useApi = () => {
  const { token } = useAuth();

  const getProducts = useCallback(async () => {
    if (!token) {
      throw new Error("No authentication token found");
    }

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

  const getCategories = useCallback(async () => {
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
      console.log("getCategories:", response.data.results);
      return response.data.results;
    } catch (error: any) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }, [token]);

  const fetchProductInfo = async (productId: number) => {};
  const addProduct = async (product: Product) => {};
  const updateProduct = async (product: Product) => {};

  return {
    getProducts,
    getCategories,
  };
};
