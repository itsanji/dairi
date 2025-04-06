/**
 * Response wrapper to ensure consistent API response format
 * Format: { success: boolean, data?: any, error?: string }
 */

// Success response type
interface SuccessResponse<T> {
    success: true;
    data: T;
}

// Error response type
interface ErrorResponse {
    success: false;
    error: string;
}

// Combined response type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Creates a success response
 * @param data The data to be returned
 * @returns A formatted success response
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: true,
        data
    };
}

/**
 * Creates an error response
 * @param error The error message
 * @returns A formatted error response
 */
export function errorResponse(error: string): ErrorResponse {
    return {
        success: false,
        error
    };
}

/**
 * Wraps a function execution in try/catch with standard response format
 * @param fn The async function to execute
 * @returns A promise that resolves to the standard response format
 */
export async function wrapResponse<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
        const result = await fn();
        return successResponse(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "System Error";
        return errorResponse(errorMessage);
    }
}

// Export types for use in other files
export type { ApiResponse, SuccessResponse, ErrorResponse };