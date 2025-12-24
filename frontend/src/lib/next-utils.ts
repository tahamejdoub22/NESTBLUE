/**
 * Next.js 15+ Utilities
 * 
 * Helper functions for handling async params and searchParams in Next.js 15+
 */

import { use } from "react";

/**
 * Type-safe wrapper for Next.js params
 * In Next.js 15+, params is a Promise and must be unwrapped
 */
export type PageProps<T extends Record<string, string | string[]> = {}> = {
  params?: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Unwrap params Promise safely
 */
export function unwrapParams<T extends Record<string, string | string[]>>(
  params: Promise<T> | T | undefined
): T | undefined {
  if (!params) return undefined;
  if (params instanceof Promise) {
    return use(params);
  }
  return params;
}

/**
 * Unwrap searchParams Promise safely
 */
export function unwrapSearchParams(
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> | undefined
): Record<string, string | string[] | undefined> | undefined {
  if (!searchParams) return undefined;
  if (searchParams instanceof Promise) {
    return use(searchParams);
  }
  return searchParams;
}



