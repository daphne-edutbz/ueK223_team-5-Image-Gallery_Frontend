import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Pagination,
    CircularProgress,
    Alert,
    Container,
    Chip,
    Tooltip,
    Skeleton,
    Tabs,
    Tab
} from '@mui/material';
import {
    CalendarToday,
    PhotoLibrary,
    Person
} from '@mui/icons-material';
import PostService, { ImagePost } from '../../../Services/PostService';

const POSTS_PER_PAGE = 12;

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{ width: 22, height: 22, display: 'block' }}
        aria-hidden="true"
    >
        {filled ? (
            <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
            />
        ) : (
            <path
                d="M16.5 4c-1.74 0-3.41.81-4.5 2.09C10.91 4.81 9.24 4 7.5 4 5 4 3 6 3 8.5c0 3.2 2.86 5.86 7.55 10.14L12 20.05l1.45-1.41C18.14 14.36 21 11.7 21 8.5 21 6 19 4 16.5 4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        )}
    </Box>
);

const GalleryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<ImagePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});

    // Aktueller Tab basierend auf URL
    const currentTab = location.pathname === '/gallery/my-posts' ? 1 : 0;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 0) {
            navigate('/gallery');
        } else {
            navigate('/gallery/my-posts');
        }
    };

    useEffect(() => {
        loadPosts();
    }, [page]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await PostService.getAllPosts({
                page: page - 1,
                size: POSTS_PER_PAGE,
                sort: 'createdAt,desc'
            });

            const pageData = response.data;
            setPosts(pageData.content);
            setTotalPages(pageData.totalPages);
            setTotalElements(pageData.totalElements);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Laden der Posts');
            console.error('Fehler beim Laden der Posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const response = await PostService.toggleLike(postId);
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId ? response.data : post
                )
            );
            setLikedPostIds(prev => ({ ...prev, [postId]: !prev[postId] }));
        } catch (err) {
            console.error('Fehler beim Liken:', err);
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading && posts.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        Galerie
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 3
                }}>
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} sx={{ borderRadius: 3 }}>
                            <Skeleton variant="rectangular" height={250} />
                            <CardContent>
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="40%" />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        );
    }

    // Error State
    if (error && posts.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert
                    severity="error"
                    action={
                        <IconButton color="inherit" size="small" onClick={loadPosts}>
                            Erneut versuchen
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{
                mb: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 50%, #0d47a1 100%)',
                borderRadius: 4,
                py: 4,
                px: 2,
                color: 'white',
                boxShadow: '0 10px 40px rgba(21, 101, 192, 0.3)'
            }}>
                <PhotoLibrary sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Galerie
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 3 }}>
                    {totalElements} {totalElements === 1 ? 'Bild' : 'Bilder'} in der Sammlung
                </Typography>

                {/* Navigation Tabs */}
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'white',
                            height: 3,
                            borderRadius: 2
                        }
                    }}
                >
                    <Tab
                        icon={<PhotoLibrary />}
                        label="Alle Posts"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            '&.Mui-selected': { color: 'white' },
                            fontWeight: 'bold',
                            minWidth: 140
                        }}
                    />
                    <Tab
                        icon={<Person />}
                        label="Meine Posts"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            '&.Mui-selected': { color: 'white' },
                            fontWeight: 'bold',
                            minWidth: 140
                        }}
                    />
                </Tabs>
            </Box>

            {/* Empty State */}
            {posts.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4
                }}>
                    <PhotoLibrary sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary">
                        Noch keine Posts vorhanden
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Sei der Erste und teile ein Bild!
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Posts Grid */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 3,
                        mb: 4
                    }}>
                        {posts.map((post, index) => (
                            <Card
                                key={post.id}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
                                    '@keyframes fadeInUp': {
                                        from: {
                                            opacity: 0,
                                            transform: 'translateY(20px)'
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: 'translateY(0)'
                                        }
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                {/* Image Container */}
                                <Box sx={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover .image-overlay': {
                                        opacity: 1
                                    },
                                    '&:hover img': {
                                        transform: 'scale(1.05)'
                                    }
                                }}>
                                    <CardMedia
                                        component="img"
                                        height="250"
                                        image={post.imageUrl}
                                        alt={post.description || 'Image'}
                                        sx={{
                                            transition: 'transform 0.5s ease',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {/* Overlay on Hover */}
                                    <Box
                                        className="image-overlay"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            p: 2
                                        }}
                                    >
                                        <Typography variant="body2" color="white" noWrap>
                                            {post.description}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Content */}
                                <CardContent sx={{ pb: 1 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: 40
                                        }}
                                    >
                                        {post.description || 'Keine Beschreibung'}
                                    </Typography>

                                    {/* Date Chip */}
                                    <Chip
                                        icon={<CalendarToday sx={{ fontSize: 14 }} />}
                                        label={formatDate(post.createdAt)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mt: 1, fontSize: 11 }}
                                    />
                                </CardContent>

                                {/* Actions */}
                                <CardActions sx={{
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    pb: 2
                                }}>
                                    {/* Like Button */}
                                    <Tooltip title="Gefällt mir">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconButton
                                                onClick={() => handleLike(post.id)}
                                                aria-label="Like"
                                                sx={{
                                                    color: likedPostIds[post.id] ? '#e91e63' : 'inherit',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                                                        transform: 'scale(1.1)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <HeartIcon filled={Boolean(likedPostIds[post.id])} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            mt: 4,
                            mb: 2
                        }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 2,
                                        fontWeight: 'medium',
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)'
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Page Info */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                    >
                        Seite {page} von {totalPages} ({totalElements} Bilder)
                    </Typography>

                    {/* Loading Overlay */}
                    {loading && (
                        <Box sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <CircularProgress size={60} />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default GalleryPage;
