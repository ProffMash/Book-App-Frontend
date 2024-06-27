// src/api/api.ts
// import axios from 'axios';
import axiosInstance from "./router";

// Define Book interface
interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
}

// const axiosInstance = axios.create({
//   baseURL: "https://bookapprepobackend.onrender.com", // Replace with your API base URL
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

export const getBooks = async (): Promise<Book[]> => {
  const response = await axiosInstance.get<Book[]>('/books');
  return response.data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await axiosInstance.get<Book>(`/books/${id}`);
  return response.data;
};

export const createBook = async (book: Book): Promise<Book> => {
  const response = await axiosInstance.post<Book>('/books', book);
  return response.data;
};

export const updateBook = async (id: string, book: Book): Promise<Book> => {
  const response = await axiosInstance.put<Book>(`/books/${id}`, book);
  return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/books/${id}`);
};
