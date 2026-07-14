import { Platform } from 'react-native';
import { TokenService } from './tokenService';

const BASE_URL = 'https://tbmdev-001-site1.dtempurl.com/api/v1';

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface CreateAiProjectPayload {
  sourceImageUrl?: string;
  outputType: number;
  generationType: number;
  prompt: string;
  contextLabel?: string;
}

export interface GenerateAiImagePayload {
  projectId: string;
  prompt: string;
  sourceImageUrl?: string;
  contextTags?: string[];
}

export interface GenerateAiVideoPayload {
  projectId: string;
  prompt: string;
  sourceImageUrl?: string;
  durationSeconds: number;
  contextTags?: string[];
}

export class ApiError extends Error {
  success: boolean;
  errors: string[] | null;
  constructor(message: string, success: boolean, errors: string[] | null = null) {
    super(message);
    this.name = 'ApiError';
    this.success = success;
    this.errors = errors;
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const text = await response.text();
      try {
        const body = JSON.parse(text);
        errorMsg = body?.message || errorMsg;
      } catch (_) {
        if (text && text.length < 150) {
          errorMsg = text;
        }
      }
    } catch (_) { }
    console.error(`[API HTTP ERROR] ${response.url} - Status ${response.status}: ${errorMsg}`);
    throw new ApiError(errorMsg, false);
  }

  let body: any;
  try {
    body = await response.json();
  } catch (err) {
    console.error(`[API PARSE ERROR] Failed to parse JSON from ${response.url}. Error:`, err);
    throw new ApiError('Failed to parse response from server.', false);
  }

  if (body && body.success === false) {
    const errorMsg = body.message || 'Request was unsuccessful.';
    const errorsList = body.errors || null;
    console.error(`[API BUSINESS ERROR] ${response.url}: ${errorMsg}`, errorsList);
    throw new ApiError(errorMsg, false, errorsList);
  }

  return body as ApiResponse<T>;
}


const productCache: Record<string, any> = {};

export const ApiService = {
  async register(payload: RegisterPayload): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        confirmPassword: payload.confirmPassword ?? payload.password,
      }),
    });
    return handleResponse<any>(response);
  },

  async login(payload: LoginPayload): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async forgotPassword(email: string): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${BASE_URL}/Auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse<boolean>(response);
  },

  async getCategories(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${BASE_URL}/Categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  async getFeaturedProducts(limit: number): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${BASE_URL}/Products/featured?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  async getCategoryById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/Categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  async getProductsByCategoryId(categoryId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/Products?categoryId=${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  cacheProducts(products: any[]) {
    products.forEach(p => {
      productCache[p.id] = p;
    });
  },

  getProductFromCache(id: string) {
    return productCache[id] || null;
  },

  async getCart(): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Cart`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse<any>(response);
  },

  async deleteCartItem(itemId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Cart/items/${itemId}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<any>(response);
  },

  async getSavedItems(page = 1, limit = 100): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Saved?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async saveItem(productId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Saved`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ itemId: productId }),
    });
    return handleResponse<any>(response);
  },

  async deleteSavedItem(savedId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Saved/${savedId}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<any>(response);
  },

  async getUserProfile(): Promise<any> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/profile`, {
      method: 'GET',
      headers,
    });
    let body: any;
    try {
      body = await response.json();
    } catch (err) {
      throw new ApiError('Failed to parse profile response.', false);
    }
    if (!response.ok) {
      const errorMsg = body?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, false);
    }
    return body;
  },

  async updateUserProfile(payload: { firstName: string; lastName: string; phoneNumber: string; email: string }): Promise<any> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    let body: any;
    try {
      body = await response.json();
    } catch (err) {
      if (response.ok) return { success: true };
      throw new ApiError('Failed to parse update profile response.', false);
    }
    if (!response.ok) {
      const errorMsg = body?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, false);
    }
    return body;
  },

  async createAddress(payload: any): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/addresses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async updateAddress(addressId: string, payload: any): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/addresses/${addressId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async deleteAddress(addressId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/addresses/${addressId}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<any>(response);
  },

  async setDefaultAddress(addressId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/addresses/${addressId}/default`, {
      method: 'PUT',
      headers,
    });
    return handleResponse<any>(response);
  },

  async requestPasswordOtp(currentPassword: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/password/otp/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword }),
    });
    return handleResponse<any>(response);
  },

  async verifyPasswordOtp(otpCode: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/password/otp/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ otpCode }),
    });
    return handleResponse<any>(response);
  },

  async changePassword(payload: any): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/password/change`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async deactivateAccount(password: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account/deactivate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ password }),
    });
    return handleResponse<any>(response);
  },

  async deleteAccount(password: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/account`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ password }),
    });
    return handleResponse<any>(response);
  },

  async uploadAvatar(uri: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    const uriParts = uri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    const fileExt = fileName.split('.').pop() || 'jpg';

    formData.append('File', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: fileName,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    } as any);

    const response = await fetch(`${BASE_URL}/account/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<any>(response);
  },
  async contactUs(payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },
  async getMyOrders(): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async getOrderDetails(orderId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async uploadRoomImage(uri: string): Promise<ApiResponse<{ url: string }>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    const uriParts = uri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    const fileExt = fileName.split('.').pop() || 'jpg';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: fileName,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    } as any);

    const response = await fetch(`${BASE_URL}/ai/upload-room`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<{ url: string }>(response);
  },

  async createAIProject(payload: {
    sourceImageUrl?: string | null;
    outputType: number;
    generationType: number;
    prompt: string;
    contextLabel?: string | null;
  }): Promise<ApiResponse<any>> {
    console.log('[API DEBUG] createAIProject payload:', JSON.stringify(payload));
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async generateAIImage(payload: {
    projectId: string;
    prompt: string;
    sourceImageUrl?: string | null;
    contextTags?: string[];
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/generate/image`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async transformAIImage(payload: {
    projectId: string;
    prompt: string;
    sourceImageUrl?: string | null;
    contextTags?: string[];
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/transform/image`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async generateAIVideo(payload: {
    projectId: string;
    prompt: string;
    sourceImageUrl?: string | null;
    durationSeconds: number;
    contextTags?: string[];
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/generate/video`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async createRenovationEstimate(payload: {
    projectName: string;
    roomType: string;
    lengthMeters: number;
    widthMeters: number;
    heightMeters: number;
    finishLevel: string;
    includeFlooring: boolean;
    includePainting: boolean;
    includeElectrical: boolean;
    includePlumbing: boolean;
    contingencyPercent: number;
    roomDimensions: {
      length: number;
      width: number;
      height: number;
    };
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/renovation/estimate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async getRenovationEstimates(): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/renovation/estimates`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async getRenovationEstimateDetails(estimateId: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/renovation/estimates/${estimateId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async getAllProducts(pageNumber: number = 1, pageSize: number = 20): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Products?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  }
};
