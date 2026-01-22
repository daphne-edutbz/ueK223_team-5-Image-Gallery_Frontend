import api from "../config/Api";

/**
 * Repräsentiert einen Image-Post (entspricht Backend ImagePostDTO)
 */
export interface ImagePost {
    id: string;
    imageUrl: string;
    description?: string;
    authorId: string;
    createdAt: string;
}

/**
 * Daten zum Erstellen eines Posts (entspricht Backend ImagePostCreateDTO)
 */
export interface CreatePostData {
    imageUrl: string;
    description?: string;
}

/**
 * Daten zum Aktualisieren eines Posts
 */
export interface UpdatePostData {
    imageUrl?: string;
    description?: string;
}

/**
 * Parameter für paginierte Abfragen (Spring Pageable Format)
 * @property page - Seitennummer (0-basiert)
 * @property size - Anzahl Elemente pro Seite
 * @property sort - Sortierung z.B. "createdAt,desc"
 */
export interface GetPostsParams {
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * Spring Page Response für paginierte Daten
 */
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * Service für alle Post-bezogenen API-Aufrufe
 */
const PostService = {
    /**
     * Holt alle Posts mit Paginierung
     * @param params - Paginierungs-Parameter
     * @returns Paginierte Liste von Posts
     */
    getAllPosts: (params?: GetPostsParams) => {
        return api.get<PageResponse<ImagePost>>('/api/image-posts', { params });
    },

    /**
     * Holt einen einzelnen Post anhand der ID
     * @param id - Post ID
     */
    getPostById: (id: string) => {
        return api.get(`/api/image-posts/${id}`);
    },

    /**
     * Erstellt einen neuen Image-Post
     * @param data - Post-Daten (imageUrl, description)
     */
    createPost: (data: CreatePostData) => {
        return api.post('/api/image-posts', data);
    },

    /**
     * Aktualisiert einen bestehenden Post
     * @param id - Post ID
     * @param data - Zu aktualisierende Felder
     */
    updatePost: (id: string, data: UpdatePostData) => {
        return api.put(`/api/image-posts/${id}`, data);
    },

    /**
     * Löscht einen Post
     * @param id - Post ID
     */
    deletePost: (id: string) => {
        return api.delete(`/api/image-posts/${id}`);
    },

    /**
     * Toggelt Like-Status eines Posts (Like hinzufügen/entfernen)
     * @param id - Post ID
     */
    toggleLike: (id: string) => {
        return api.post(`/api/image-posts/${id}/like`);
    },
};

export default PostService;
