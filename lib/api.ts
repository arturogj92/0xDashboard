import { Reel, Keyword, PublicComment, Response, ApiResponse, DmLog, Media, Story, LoginCredentials, RegisterCredentials, AuthResponse, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Reels
export const createReel = async (data: Omit<Media, 'id' | 'media_id' | 'created_at' | 'updated_at'>, is_draft?: boolean): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, is_draft }),
    });
    return response.json();
};
export const getReelDmLogs = async (reelId: number): Promise<ApiResponse<{
  total: number;
  logs: DmLog[]
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-logs`);
  return response.json();
};



export const getReelDmTotalCountToday = async (reelId: number): Promise<ApiResponse<{
  total_count_today: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count-today`);
  return response.json();
};

export const getReelDmTotalCount = async (reelId: number): Promise<ApiResponse<{
  total_count: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count`);
  return response.json();
};

export const getReelDmTotalCount7d = async (reelId: number): Promise<ApiResponse<{
  total_count_7d: number;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-total-count-7d`);
  return response.json();
};

export const getReel = async (id: number): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}`);
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
export const updateReelDescription = async (id: number, description: string, publish_draft?: boolean, url?: string): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}/description`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

export const deleteReel = async (id: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const getReels = async (): Promise<ApiResponse<Media[]>> => {
    const response = await fetch(`${API_URL}/api/reels`);
    const data = await response.json();
    if (data.success) {
        // Convertir el tipo según media_type
        return {
            ...data,
            data: data.data.map((item: any) => {
                if (item.media_type === 'story') {
                    return item as Story;
                } else {
                    return item as Reel;
                }
            })
        };
    }
    return data;
};

export const toggleReelStatus = async (id: number, isActive: boolean): Promise<ApiResponse<Media>> => {
    const response = await fetch(`${API_URL}/api/reels/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};
// Función para eliminar una palabra clave específica de un reel
export const deleteReelKeyword = async (reelId: number, keywordId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/keywords/${keywordId}`, {
        method: 'DELETE',
    });
    return response.json();
};

// Keywords
export const createKeyword = async (data: Keyword): Promise<ApiResponse<Keyword>> => {
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};
// Public Comments
export const createPublicComment = async (data: PublicComment): Promise<ApiResponse<PublicComment>> => {
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/public-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_message: data.comment_message }),
    });
    return response.json();
};

export const generateAIPublicComments = async (reelId: number, count: number): Promise<ApiResponse<PublicComment[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/generate-multiple-public-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
    });
    return response.json();
};

export const getReelPublicComments = async (reelId: number): Promise<ApiResponse<PublicComment[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/public-comments`);
    return response.json();
};

export const updatePublicComment = async (id: number, data: Partial<PublicComment>): Promise<ApiResponse<PublicComment>> => {
    const response = await fetch(`${API_URL}/api/public-comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};
export const deletePublicComment = async (reelId: number, commentId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/public-comments/${commentId}`, {
        method: 'DELETE',
    });
    return response.json();
};

// Responses
export const createOrUpdateResponse = async (data: Response): Promise<ApiResponse<Response>> => {
    const response = await fetch(`${API_URL}/api/media/${data.media_id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getMediaResponses = async (mediaId: number): Promise<ApiResponse<Response[]>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/responses`);
    return response.json();
};

export const deleteResponse = async (mediaId: number, responseId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/responses/${responseId}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const getReelDmDailyCountLastWeek = async (reelId: number): Promise<ApiResponse<{
  daily_stats: Array<{
    day: string;
    count: number;
  }>;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-daily-count-last-week`);
  return response.json();
};

export const getReelDmHourlyCountCurrentDay = async (reelId: number): Promise<ApiResponse<{
  hourly_stats: Array<{
    hour: string;
    count: number;
  }>;
}>> => {
  const response = await fetch(`${API_URL}/api/reels/${reelId}/dm-hourly-count-current-day`);
  return response.json();
};

// Stories
export const createStory = async (data: Omit<Story, 'id' | 'media_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getStories = async (): Promise<ApiResponse<Story[]>> => {
    const response = await fetch(`${API_URL}/api/stories`);
    const data = await response.json();
    if (data.success) {
        return {
            ...data,
            data: data.data.map((item: any) => item as Story)
        };
    }
    return data;
};

export const getStory = async (id: number): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}`);
    return response.json();
};

export const updateStoryDescription = async (id: number, description: string): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
    });
    const data = await response.json();
    if (data.success) {
        return {
            ...data,
            data: data.data as Story
        };
    }
    return data;
};

export const deleteStory = async (id: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const toggleStoryStatus = async (id: number, isActive: boolean): Promise<ApiResponse<Story>> => {
    const response = await fetch(`${API_URL}/api/stories/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
    });
    return response.json();
};

// Story Keywords
export async function getStoryKeywords(storyId: number): Promise<ApiResponse<Keyword[]>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/keywords`);
    return response.json();
}

export async function createOrUpdateStoryKeyword(keyword: Omit<Keyword, 'id'>): Promise<ApiResponse<Keyword>> {
    const response = await fetch(`${API_URL}/api/media/${keyword.media_id}/keywords`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyword),
    });
    return response.json();
}

export async function deleteStoryKeyword(storyId: number, keywordId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/keywords/${keywordId}`, {
        method: 'DELETE',
    });
    return response.json();
}

// Story Responses
export async function getStoryResponses(storyId: number): Promise<ApiResponse<Response[]>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/responses`);
    return response.json();
}


export async function deleteStoryResponse(storyId: number, responseId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/api/stories/${storyId}/responses/${responseId}`, {
        method: 'DELETE',
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    return response.json();
}

export const publishReel = async (id: number, url: string, description: string): Promise<ApiResponse<any>> => {
    console.log(`Publicando reel ${id} con URL: ${url}`); // Debug
    const response = await fetch(`${API_URL}/api/reels/${id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description }),
    });
    const data = await response.json();
    console.log('Respuesta del servidor al publicar:', data); // Debug
    return data;
};

export const updateReelUrl = async (reelId: number, url: string): Promise<ApiResponse<Media>> => {
    try {
        const response = await fetch(`${API_URL}/api/reels/${reelId}/url`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        if (data.success) {
            return {
                ...data,
                data: data.data as Reel
            };
        }
        return {
            success: false,
            message: data.message || 'Error al actualizar la URL del reel',
            data: {} as Media
        };
    } catch (error) {
        return { 
            success: false, 
            message: 'Error al actualizar la URL del reel',
            data: {} as Media
        };
    }
};

// Generic Media Keyword delete
export const deleteKeyword = async (mediaId: number, keywordId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/keywords/${keywordId}`, {
        method: 'DELETE',
    });
    return response.json();
};

// Generic Media Keywords
export const getMediaKeywords = async (mediaId: number): Promise<ApiResponse<Keyword[]>> => {
    const response = await fetch(`${API_URL}/api/media/${mediaId}/keywords`);
    return response.json();
};

// Funciones de autenticación
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    console.log('Registrando usuario:', credentials);
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    console.log('Respuesta del servidor al registrar:', data);

    if (data.success && data.data?.token) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.data.token);
    }

    return data;
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('Iniciando sesión:', credentials);
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    console.log('Respuesta del servidor al iniciar sesión:', data);

    if (data.success && data.data?.token) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.data.token);
    }

    return data;
};

export const getUserProfile = async (): Promise<ApiResponse<User>> => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { success: false, data: null as any, message: 'No hay token disponible' };
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
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

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
}; 