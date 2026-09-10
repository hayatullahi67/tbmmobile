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
  style?: string; // ← NEW FIELD
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
      console.error(`[API ERROR RAW BODY] ${response.url}:`, text);
      try {
        const body = JSON.parse(text);
        errorMsg = body?.message || body?.title || errorMsg;
        if (body?.errors) {
          errorMsg += ` - Errors: ${JSON.stringify(body.errors)}`;
        }
      } catch (_) {
        if (text && text.length < 300) {
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

  async getAiProjects(): Promise<ApiResponse<any[]>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/ai/projects`, {
      method: 'GET',
      headers,
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

  async uploadRoomImage(uri: string): Promise<ApiResponse<{ url?: string; imageUrl?: string }>> {
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
    return handleResponse<{ url?: string; imageUrl?: string }>(response);
  },

  async uploadDocument(uri: string): Promise<ApiResponse<{ url: string }>> {
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

    const response = await fetch(`${BASE_URL}/uploads/document`, {
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
    style?: string | null; // ← NEW FIELD
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
    style?: string | null;
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
    lengthM: number;
    widthM: number;
    heightM: number;
    qualityTier: number;
    contingencyPercent: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const legacyLabels = ['Cosmetic Refresh', 'Standard Renovation', 'Major Renovation', 'Complete Remodel'];
    const guideLabels = ['Budget', 'Standard', 'Premium', 'Luxury'];

    const bodyPayload = {
      ...payload,
      // Dimension alias variations to satisfy all backend C# DTO bindings
      lengthMeters: payload.lengthM,
      widthMeters: payload.widthM,
      heightMeters: payload.heightM,
      length: payload.lengthM,
      width: payload.widthM,
      height: payload.heightM,
      roomDimensions: {
        length: payload.lengthM,
        width: payload.widthM,
        height: payload.heightM,
      },
      // Quality/Finish variations (CamelCase & PascalCase) to satisfy all backend schemas
      qualityTier: payload.qualityTier,
      QualityTier: payload.qualityTier,
      quality: payload.qualityTier,
      Quality: payload.qualityTier,
      tier: payload.qualityTier,
      Tier: payload.qualityTier,
      finishLevel: legacyLabels[payload.qualityTier] || 'Standard Renovation',
      FinishLevel: legacyLabels[payload.qualityTier] || 'Standard Renovation',
      complexity: legacyLabels[payload.qualityTier] || 'Standard Renovation',
      Complexity: legacyLabels[payload.qualityTier] || 'Standard Renovation',
      qualityTierName: guideLabels[payload.qualityTier] || 'Standard',
      QualityTierName: guideLabels[payload.qualityTier] || 'Standard',
    };

    console.log('[API DEBUG] createRenovationEstimate payload:', JSON.stringify(bodyPayload));

    const response = await fetch(`${BASE_URL}/ai/renovation-estimates`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
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
    const response = await fetch(`${BASE_URL}/ai/renovation-estimates`, {
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
    const response = await fetch(`${BASE_URL}/ai/renovation-estimates/${estimateId}`, {
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
  },

  async getAiStyles(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${BASE_URL}/ai/styles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  async getInspiration(category?: string, style?: string): Promise<ApiResponse<any[]>> {
    const queryParams: string[] = [];
    if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
    if (style) queryParams.push(`style=${encodeURIComponent(style)}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const response = await fetch(`${BASE_URL}/inspiration${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  async request3DDesign(payload: {
    estimateId: string;
    projectDescription: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    additionalNotes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/project-requests/3d-model`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async requestBOQ(payload: {
    estimateId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    additionalNotes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/project-requests/boq`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async requestDesignerContact(payload: {
    estimateId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    additionalNotes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/project-requests/contact-designer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async verifyInspectionPayment(payload: { reference: string }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/inspections/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<any>(response);
    console.log('[API DEBUG] verifyInspectionPayment response:', JSON.stringify(result, null, 2));
    return result;
  },

  async bookInspection(payload: {
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    siteAddress: string;
    siteCity: string;
    siteState: string;
    preferredDate1: string;
    preferredDate2: string;
    propertyType: string;
    consultationType: number;
    uploadedFileUrls?: string[];
    paymentReference?: string;
    additionalNotes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/inspections/book`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async initializeInspectionPayment(inspectionId: string, email: string): Promise<ApiResponse<{ authorizationUrl: string; reference: string }>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/inspections/${inspectionId}/initialize-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    });
    return handleResponse<any>(response);
  },

  async getCheckout(promoCode?: string | null): Promise<any> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const url = promoCode
      ? `${BASE_URL}/Checkout?promoCode=${encodeURIComponent(promoCode)}`
      : `${BASE_URL}/Checkout`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    let body: any;
    try {
      body = await response.json();
    } catch (err) {
      if (response.ok) return null;
      throw new ApiError('Failed to parse checkout response.', false);
    }
    if (!response.ok) {
      const errorMsg = body?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, false);
    }
    return body;
  },

  async validatePromoCode(code: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Checkout/validate-promo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });
    return handleResponse<any>(response);
  },

  async initiateCheckoutPayment(payload: any): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Checkout/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async verifyCheckoutPayment(reference: string): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/Checkout/payment/paystack/verify/${reference}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<any>(response);
  },

  async bookConsultation(payload: {
    typeKey: string;
    scheduledStart: string;
    projectId?: string | null;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    propertyType: string;
    siteAddress?: string;
    siteCity?: string;
    siteState?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/consultations/book`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async initializeConsultationPayment(
    consultationId: string,
    consultationToken: string,
    email: string
  ): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Consultation-Token': consultationToken,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/consultations/${consultationId}/initialize-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    });
    return handleResponse<any>(response);
  },

  async verifyConsultationPayment(payload: { reference: string }): Promise<ApiResponse<any>> {
    const token = await TokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/consultations/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(response);
  },

  async getInspectionAvailability(
    consultationType: number,
    date: string,
    state: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${BASE_URL}/inspections/availability?consultationType=${consultationType}&date=${date}&state=${encodeURIComponent(state)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return handleResponse<any>(response);
  }
};
