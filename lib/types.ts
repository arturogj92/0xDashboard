export interface Media {
    id: number;
    media_id: string;
    url: string;
    description: string;
    is_active: boolean;
    media_type: 'reel' | 'story';
    keywords?: Keyword[];
    responses?: Response[];
    thumbnail_url?: string;
    totalVisits?: number;
    visits24?: number;
    visits7d?: number;
}

export interface Reel extends Media {
    media_type: 'reel';
    shortcode: string;
    publicComments?: PublicComment[];
}

export interface Story extends Media {
    media_type: 'story';
}

export interface DmLog {
    id: number;
    reel_id: number;
    instagram_user_name: string;
    sent_at: string;
}

export interface Keyword {
    id: number;
    media_id: number;
    reel_id?: number;
    keyword: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PublicComment {
    id: number;
    reel_id: number;
    comment_message: string;
}

export interface Response {
    id: number;
    media_id: number;
    name: string;
    dm_message: string;
    button_text?: string;
    button_url?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    name?: string;
    avatar_url?: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
    };
    message?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    name?: string;
} 