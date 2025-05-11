import { Reel, Keyword, PublicComment, Response, ApiResponse, DmLog, Media, Story, LoginCredentials, RegisterCredentials, AuthResponse, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Función auxiliar para obtener el token
const getAuthToken = () => {
  if (typeof window === 'undefined') {
    // Estamos en SSR, no hay localStorage
    return null;
  }
  
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error al acceder a localStorage:', error);
    return null;
  }
};

// Función para crear headers con autenticación
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Reels
export const createReel = async (data: { url: string, description: string, is_active: boolean, media_type: string }, isDraft: boolean = false): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ ...data, is_draft: isDraft }),
    });
    return response.json();
};

export const getReelDmLogs = async (reelId: number): Promise<ApiResponse<{
  total: number;
  logs: DmLog[]
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-logs`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReelDmTotalCountToday = async (reelId: number): Promise<ApiResponse<{
  total_count_today: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count-today`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReelDmTotalCount = async (reelId: number): Promise<ApiResponse<{
  total_count: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReelDmTotalCount7d = async (reelId: number): Promise<ApiResponse<{
  total_count_7d: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count-7d`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReel = async (id: number): Promise<ApiResponse<Media> & { statusCode?: number }> => {
    const response = await fetch(`${API_URL}/api/reels/${id}`, {
        headers: createAuthHeaders()
    });
    const data = await response.json();
    
    // Si no es exitoso, añadir el código de estado HTTP
    if (!data.success) {
        return {
            ...data,
            statusCode: response.status
        };
    }
    
    // Si es exitoso, procesar el tipo de datos según sea reel o story
    if (data.data.media_type === 'story') {
        return {
            ...data,
            data: data.data as Story
        };
    } else {
        return {
            ...data,
            data: data.data as Reel
        };
    }
};

export const updateReelDescription = async (id: number, description: string, publish_draft?: boolean, url?: string): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}/description`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ description, publish_draft, url }),
    });
    const data = await response.json();
    if (data.success) {
        // Convertir el tipo según media_type
        if (data.data.media_type === 'story') {
            return {
                ...data,
                data: data.data as Story
            };
        } else {
            return {
                ...data,
                data: data.data as Reel
            };
        }
    }
    return data;
};

export const deleteReel = async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: 'date' | 'visits';
  order?: 'asc' | 'desc';
  hide_draft?: boolean;
  hide_active?: boolean;
  hide_inactive?: boolean;
}

export const getReels = async (options: PaginationQuery = {}): Promise<ApiResponse<Media[]> & { pagination?: any }> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);
    if (options.hide_draft !== undefined) params.append('hide_draft', String(options.hide_draft));
    if (options.hide_active !== undefined) params.append('hide_active', String(options.hide_active));
    if (options.hide_inactive !== undefined) params.append('hide_inactive', String(options.hide_inactive));

    const response = await fetch(`${API_URL}/api/reels?${params.toString()}`, {
        headers: createAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
        return {
            ...data,
            data: data.data.map((item: any) => (item.media_type === 'story' ? (item as Story) : (item as Reel)))
        };
    }
    return data;
};

export const toggleReelStatus = async (id: number, isActive: boolean): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}/status`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
    });
    const data = await response.json();
    if (data.success) {
        // Convertir el tipo según media_type
        if (data.data.media_type === 'story') {
            return {
                ...data,
                data: data.data as Story
            };
        } else {
            return {
                ...data,
                data: data.data as Reel
            };
        }
    }
    return data;
};

// Keywords
export const createOrUpdateKeyword = async (data: Keyword): Promise<ApiResponse<Keyword>> => {
    const response = await fetch(`${API_URL}/api/media/${data.media_id}/keywords`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({
            id: data.id || 0,
            media_id: data.media_id,
            keyword: data.keyword,
            is_active: data.is_active
        }),
    });
    return response.json();
};

export const getReelKeywords = async (mediaId: number): Promise<ApiResponse<Keyword[]>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/keywords`);
    return response.json();
};

export const updateKeyword = async (id: number, data: Partial<Keyword>): Promise<ApiResponse<Keyword>> => {
    const response = await fetch(`${API_URL}/api/keywords/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

// Función para eliminar una palabra clave específica de un reel
export const deleteReelKeyword = async (reelId: number, keywordId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

// Keywords
export const createKeyword = async (data: Keyword): Promise<ApiResponse<Keyword>> => {
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/keywords`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

// Public Comments
export const createPublicComment = async (data: PublicComment): Promise<ApiResponse<PublicComment>> => {
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/public-comments`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ comment_message: data.comment_message }),
    });
    return response.json();
};

export const generateAIPublicComments = async (reelId: number, count: number): Promise<ApiResponse<PublicComment[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/generate-multiple-public-comments`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ count }),
    });
    return response.json();
};

export const getReelPublicComments = async (reelId: number): Promise<ApiResponse<PublicComment[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/public-comments`, {
        headers: createAuthHeaders()
    });
    return response.json();
};

export const updatePublicComment = async (id: number, data: Partial<PublicComment>): Promise<ApiResponse<PublicComment>> => {
    const response = await fetch(`${API_URL}/api/public-comments/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const deletePublicComment = async (reelId: number, commentId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/public-comments/${commentId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

// Responses
export const createOrUpdateResponse = async (data: Response): Promise<ApiResponse<Response>> => {
    const response = await fetch(`${API_URL}/api/media/${data.media_id}/responses`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getMediaResponses = async (mediaId: number): Promise<ApiResponse<Response[]>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/responses`, {
        headers: createAuthHeaders()
    });
    return response.json();
};

export const deleteResponse = async (mediaId: number, responseId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/responses/${responseId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

export const getReelDmDailyCountLastWeek = async (reelId: number): Promise<ApiResponse<{
  daily_stats: Array<{
    day: string;
    count: number;
  }>;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-daily-count-last-week`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReelDmConsolidatedStats = async (mediaId: string | number = 'all'): Promise<ApiResponse<{
  daily_breakdown: Array<{
    day: string;
    count: number;
  }>;
  today_total: number;
  last_7_days_total: number;
  all_time_total: number;
  media_id: string;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${mediaId}/dm-consolidated-stats`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getAllMediaDmConsolidatedStats = async (): Promise<ApiResponse<{
  overall: {
    daily_breakdown: Array<{
      day: string;
      count: number;
    }>;
    today_total: number;
    last_7_days_total: number;
    all_time_total: number;
  },
  by_media: Record<string, {
    daily_breakdown: Array<{
      day: string;
      count: number;
    }>;
    today_total: number;
    last_7_days_total: number;
    all_time_total: number;
    media_id: string;
  }>
}>> => {
  const response = await fetch(`${API_URL}/api/reels/stats/all-dm-consolidated`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export const getReelDmHourlyCountCurrentDay = async (reelId: number): Promise<ApiResponse<{
  hourly_stats: Array<{
    hour: string;
    count: number;
  }>;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-hourly-count-current-day`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

// Stories
export const createStory = async (data: { url: string, description: string, is_active: boolean, media_type: string }): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getStories = async (options: PaginationQuery = {}): Promise<ApiResponse<Story[]> & { pagination?: any }> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);
    if (options.hide_active !== undefined) params.append('hide_active', String(options.hide_active));
    if (options.hide_inactive !== undefined) params.append('hide_inactive', String(options.hide_inactive));

    const response = await fetch(`${API_URL}/api/stories?${params.toString()}`, {
        headers: createAuthHeaders()
    });
    return response.json();
};

export const getStory = async (id: number): Promise<ApiResponse<Story> & { statusCode?: number }> => {
    const response = await fetch(`${API_URL}/api/stories/${id}`, {
        headers: createAuthHeaders()
    });
    const data = await response.json();
    
    // Si no es exitoso, añadir el código de estado HTTP
    if (!data.success) {
        return {
            ...data,
            statusCode: response.status
        };
    }
    
    return data;
};

export const updateStoryDescription = async (id: number, description: string): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}/description`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ description }),
    });
    return response.json();
};

export const deleteStory = async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

export const toggleStoryStatus = async (id: number, isActive: boolean): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}/status`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
    });
    return response.json();
};

// Story Keywords
export async function getStoryKeywords(storyId: number): Promise<ApiResponse<Keyword[]>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/keywords`, {
        headers: createAuthHeaders()
    });
    return response.json();
}

export async function createOrUpdateStoryKeyword(keyword: Omit<Keyword, 'id'>): Promise<ApiResponse<Keyword>> {
    const response = await fetch(`${API_URL}/api/media/${keyword.media_id}/keywords`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(keyword),
    });
    return response.json();
}

export async function deleteStoryKeyword(storyId: number, keywordId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
}

// Story Responses
export async function getStoryResponses(storyId: number): Promise<ApiResponse<Response[]>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/responses`, {
        headers: createAuthHeaders()
    });
    return response.json();
}

export async function deleteStoryResponse(storyId: number, responseId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/responses/${responseId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
}

// AI Response Generation
export interface AIResponseGenerationParams {
    prompt: string;
    includeButton: boolean;
    buttonUrl?: string;
    responseName: string;
    save: boolean;
}

export async function generateAIResponse(mediaId: number, params: AIResponseGenerationParams): Promise<ApiResponse<Response>> {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/generate-complete-response`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(params),
    });
    return response.json();
}

export const publishReel = async (id: number, url: string, description: string): Promise<ApiResponse<any>> => {
    console.log(`Publicando reel ${id} con URL: ${url}`); // Debug
    const response = await fetch(`${API_URL}/api/reels/${id}/publish`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ url, description }),
    });
    const data = await response.json();
    console.log('Respuesta del servidor al publicar:', data); // Debug
    return data;
};

export const updateReelUrl = async (id: number, url: string): Promise<ApiResponse<Reel>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}/url`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ url }),
    });
    return response.json();
};

// Generic Media Keyword delete
export const deleteKeyword = async (mediaId: number, keywordId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
    });
    return response.json();
};

// Generic Media Keywords
export const getMediaKeywords = async (mediaId: number): Promise<ApiResponse<Keyword[]>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/keywords`, {
        headers: createAuthHeaders()
    });
    return response.json();
};

// Funciones de autenticación
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    console.log('Registrando usuario:', credentials);
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Respuesta del servidor al registrar:', data);

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            return { 
                success: false, 
                data: { token: '', user: {} as User },
                message: data.message || `Error ${response.status}: ${response.statusText}`
            };
        }

        if (data.success && data.data?.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.data.token);
            console.log('Token guardado:', data.data.token);
        }

        return data;
    } catch (error) {
        console.error('Error en la petición de registro:', error);
        return { 
            success: false, 
            data: { token: '', user: {} as User },
            message: 'Error de red al intentar registrar' 
        };
    }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('Iniciando sesión:', credentials);
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Respuesta del servidor al iniciar sesión:', data);

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            return { 
                success: false, 
                data: { token: '', user: {} as User },
                message: data.message || `Error ${response.status}: ${response.statusText}`
            };
        }

        if (data.success && data.data?.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.data.token);
            console.log('Token guardado:', data.data.token);
        }

        return data;
    } catch (error) {
        console.error('Error en la petición de login:', error);
        return { 
            success: false, 
            data: { token: '', user: {} as User },
            message: 'Error de red al intentar iniciar sesión' 
        };
    }
};

export const getUserProfile = async (): Promise<ApiResponse<User>> => {
    const token = getAuthToken();
    if (!token) {
        return { success: false, data: null as any, message: 'No hay token disponible' };
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'GET',
            headers: createAuthHeaders(),
        });
        
        if (!response.ok) {
            // Si la respuesta no es exitosa (ej. 401), borrar el token
            if (response.status === 401) {
                localStorage.removeItem('token');
            }
            return { success: false, data: null as any, message: `Error ${response.status}: ${response.statusText}` };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return { success: false, data: null as any, message: 'Error de red al obtener el perfil' };
    }
};

export const verifyToken = async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
};

/**
 * Llama al backend para procesar el login con Google.
 * @param idToken El token de ID obtenido de Google.
 * @returns La respuesta de autenticación del backend.
 */
export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
        console.error('Error en login con Google:', data.message || 'Error desconocido devuelto por la API');
        return {
            success: false,
            data: data?.data ?? { token: '', user: {} as User },
            message: data?.message || 'Error en el servidor'
        };
    }

    if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        console.log('Token de Google guardado:', data.data.token);
    }

    return data;

  } catch (error) {
    console.error('Error de red o excepción en loginWithGoogle:', error);
    return {
        success: false,
        data: { token: '', user: {} as User },
        message: 'No se pudo conectar con el servidor.'
    };
  }
};

/**
 * Obtiene los reels de Instagram del usuario autenticado
 * @param limit Número máximo de reels a obtener (opcional)
 * @param afterCursor ID del último reel para paginación (opcional)
 * @returns ApiResponse con la cuenta de Instagram y los reels
 */
export const getUserInstagramReels = async (limit?: number, afterCursor?: string): Promise<ApiResponse<{
  instagram_account: {
    id: string;
    username: string;
    profile_picture_url: string;
    media_count: number;
  };
  reels: Array<{
    id: string;
    caption: string;
    media_type: string;
    media_url: string;
    permalink: string;
    thumbnail_url: string;
    timestamp: string;
    shortcode: string;
  }>;
  pagination: {
    has_next_page: boolean;
    next_cursor: string | null;
  };
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (afterCursor) queryParams.append('after', afterCursor);
    
    const url = `${API_URL}/api/auth/instagram/reels${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      console.error('Error al obtener reels de Instagram:', response.status, response.statusText);
      return { 
        success: false, 
        data: null as any, 
        message: `Error ${response.status}: ${response.statusText}` 
      };
    }

    const result = await response.json();
    // Si la respuesta es exitosa, asegurar que siempre haya instagram_account
    if (result.success && result.data) {
      const { reels, pagination, instagram_account } = result.data;
      return {
        success: result.success,
        data: {
          instagram_account: instagram_account ?? {
            id: '',
            username: '',
            profile_picture_url: '',
            media_count: Array.isArray(reels) ? reels.length : 0
          },
          reels,
          pagination
        },
        message: result.message
      };
    }
    return result;
  } catch (error) {
    console.error('Error en la petición para obtener reels de Instagram:', error);
    return { 
      success: false, 
      data: null as any, 
      message: 'Error de red al obtener los reels de Instagram' 
    };
  }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

// Batch stats (hasta 10 IDs por petición)
export const getMediaBatchStats = async (
  mediaIds: number[],
  timezone?: string
): Promise<ApiResponse<Array<{
  media_id: number;
  today_total: number;
  last_7_days_total: number;
  all_time_total: number;
}>>> => {
  const response = await fetch(`${API_URL}/api/media/stats/batch`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({
      media_ids: mediaIds,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    })
  });
  return response.json();
};

export const getMediaDmStats = async (
  mediaId: number,
  timezone?: string
): Promise<ApiResponse<{
  hourly_stats: Array<{ hour: string; count: number }>;
  daily_stats: Array<{ day: string; count: number }>;
  today_total: number;
  last_7_days_total: number;
  all_time_total: number;
}>> => {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const response = await fetch(`${API_URL}/api/media/${mediaId}/dm-stats?timezone=${encodeURIComponent(tz)}`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

// ---------------- Password reset -----------------
export const requestPasswordReset = async (email: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ email })
    });
    return response.json();
};

export const validateResetToken = async (token: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_URL}/api/auth/reset-password/validate?token=${token}`, {
        headers: createAuthHeaders()
    });
    return response.json();
};

export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ token, newPassword })
    });
    return response.json();
};

// Update a user preference
export const updatePreference = async (key: string, value: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/api/auth/preferences`, {
    method: 'PUT',
    headers: createAuthHeaders(),
    body: JSON.stringify({ key, value }),
  });
  if (response.ok) {
    const data = await response.json();
    return data.success;
  }
  console.error('Failed to update preference', key, value, response.status);
  return false;
};

/**
 * Obtiene estadísticas globales de DMs filtradas por tipo de medio.
 * @param {string} timezone Zona horaria IANA (p.ej. 'Europe/Madrid').
 * @param {string|null} mediaType 'reel' | 'story' o null para todos.
 */
export async function getGlobalMediaStats(
  timezone: string = 'UTC',
  mediaType: string | null = 'reel'
) {
  const response = await fetch(`${API_URL}/api/media/stats/global`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({ timezone, media_type: mediaType }),
  });
  return response.json();
}

/**
 * Obtiene estadísticas globales de DMs filtradas para historias.
 * @param {string} timezone Zona horaria IANA (p.ej. 'Europe/Madrid').
 * @param {string|null} mediaType 'story' | 'reel' o null para todos.
 */
export async function getGlobalStoryStats(
  timezone: string = 'UTC',
  mediaType: string | null = 'story'
) {
  const response = await fetch(`${API_URL}/api/media/stats/global`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({ timezone, media_type: mediaType }),
  });
  return response.json();
}

/**
 * Sube un vídeo al generador de descripciones y obtiene el mediaId para seguimiento
 */
export const uploadMedia = async (file: File): Promise<ApiResponse<{ mediaId: number }>> => {
  const formData = new FormData();
  formData.append('file', file);
  // Eliminar Content-Type para que el navegador establezca el boundary
  const headers = createAuthHeaders();
  delete headers['Content-Type'];
  const response = await fetch(`${API_URL}/api/caption-generator/upload`, {
    method: 'POST',
    headers,
    body: formData
  });
  return response.json();
};

/**
 * Consulta el estado y la transcripción de un media subido previamente
 */
export const getMediaStatus = async (mediaId: number): Promise<ApiResponse<{ status: string; transcript: string; captionId?: number; instagramText?: string; youtubeText?: string }>> => {
  const response = await fetch(`${API_URL}/api/caption-generator/${mediaId}`, {
    headers: createAuthHeaders()
  });
  return response.json();
};

export interface CaptionGenOptions {
  includeEmojis?: boolean;
  link?: string;
  mention?: string;
  instagramMax?: number;
  youtubeMax?: number;
  xEnabled?: boolean;
  xIsThread?: boolean;
  xMaxChars?: number;
  xThreadCount?: number;
}

export const generateCaptions = async (
  mediaId: number,
  options: CaptionGenOptions
): Promise<ApiResponse<{ instagramText?: string; youtubeText?: string; xText?: string | string[] }>> => {
  const response = await fetch(`${API_URL}/api/caption-generator/generate`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({ mediaId, options, platforms: ['instagram','youtube', options.xEnabled ? 'x' : undefined].filter(Boolean) }),
  });
  return response.json();
};

// Obtener historial de captions generadas por el usuario
export const getCaptionHistory = async (): Promise<ApiResponse<Array<{ id: number; instagramText: string; youtubeText: string; createdAt: string }>>> => {
  const response = await fetch(`${API_URL}/api/caption-generator/history`, {
    headers: createAuthHeaders(),
  });
  return response.json();
}; 