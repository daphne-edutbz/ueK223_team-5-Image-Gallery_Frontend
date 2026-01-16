import api from "../config/Api";

// Interface muss mit Backend ImagePostDTO übereinstimmen!
export interface ImagePost {
    id: string;
    imageUrl: string;
    description?: string;
    authorId: string;      // Backend: authorId (nicht userId)
    createdAt: string;
}

// Backend: ImagePostCreateDTO
export interface CreatePostData {
    imageUrl: string;
    description?: string;
}

export interface UpdatePostData {
    imageUrl?: string;
    description?: string;
}

// Spring Pageable Parameter
export interface GetPostsParams {
    page?: number;   // Spring: 0-basiert!
    size?: number;   // Spring: "size" nicht "limit"
    sort?: string;   // Spring: "createdAt,desc"
}

// Spring Page Response
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;  // aktuelle Seite (0-basiert)
    size: number;
}

const PostService = {
    // Alle Posts holen (Spring Pageable Format)
    getAllPosts: (params?: GetPostsParams) => {
        return api.get<PageResponse<ImagePost>>('/api/image-posts', { params });
    },

    // Einzelnen Post holen
    getPostById: (id: string) => {
        return api.get(`/api/image-posts/${id}`);
    },

    // Image-Post erstellen (Backend erwartet JSON, nicht FormData)
    createPost: (data: CreatePostData) => {
        return api.post('/api/image-posts', data);
    },

    // Eigenen Post bearbeiten
    updatePost: (id: string, data: UpdatePostData) => {
        return api.put(`/api/image-posts/${id}`, data);
    },

    // Eigenen Post löschen
    deletePost: (id: string) => {
        return api.delete(`/api/image-posts/${id}`);
    },

    // Like hinzufügen/entfernen (Toggle)
    toggleLike: (id: string) => {
        return api.post(`/api/image-posts/${id}/like`);
    },
};

export default PostService;
