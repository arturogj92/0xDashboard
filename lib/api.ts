import { Reel, Keyword, PublicComment, Response, ApiResponse, DmLog, Media, Story } from './types';

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
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getReelKeywords = async (reelId: number): Promise<ApiResponse<Keyword[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/keywords`);
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
    const response = await fetch(`${API_URL}/api/reels/${data.reel_id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getReelResponses = async (reelId: number): Promise<ApiResponse<Response[]>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/responses`);
    return response.json();
};


export const deleteResponse = async (reelId: number, responseId: number): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/api/reels/${reelId}/responses/${responseId}`, {
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
    const response = await fetch(`${API_URL}/api/stories/${id}/description`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
    });
    return response.json();
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