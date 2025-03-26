export interface Reel {
    id: number;
    shortcode: string;
    media_id: string;
    url: string;
    description: string;
    is_active: boolean;
    keywords?: Keyword[];
    responses?: Response[];
    publicComments?: PublicComment[];
    thumbnailUrl?: string;
}

export interface Keyword {
    id: number;
    reel_id: number;
    keyword: string;
    is_active: boolean;
}


export interface PublicComment {
    id: number;
    reel_id: number;
    comment_message: string;
}

export interface Response {
    reel_id: number;
    name: string;
    dm_message: string;
    button_text: string;
    button_url: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
} 