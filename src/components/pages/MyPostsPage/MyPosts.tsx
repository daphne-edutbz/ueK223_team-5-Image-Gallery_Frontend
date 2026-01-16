import React, { useContext, useEffect, useState } from 'react';
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
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Fab
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    Delete,
    Edit,
    CalendarToday,
    PhotoLibrary,
    Person,
    Add,
    Close
} from '@mui/icons-material';
import PostService, { ImagePost, CreatePostData } from '../../../Services/PostService';
import ActiveUserContext from '../../../Contexts/ActiveUserContext';

const POSTS_PER_PAGE = 10;

const MyPosts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(ActiveUserContext);

    const [posts, setPosts] = useState<ImagePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ImagePost | null>(null);
    const [formData, setFormData] = useState<CreatePostData>({
        imageUrl: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

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
        if (user) {
            loadMyPosts();
        }
    }, [page, user]);

    const loadMyPosts = async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Alle Posts laden und nach authorId filtern
            const response = await PostService.getAllPosts({
                page: 0,
                size: 1000, // Alle laden für Filterung
                sort: 'createdAt,desc'
            });

            const allPosts = response.data.content;
            // Nur eigene Posts filtern
            const myPosts = allPosts.filter(post => post.authorId === user.id);

            // Pagination im Frontend
            const startIndex = (page - 1) * POSTS_PER_PAGE;
            const paginatedPosts = myPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

            setPosts(paginatedPosts);
            setTotalElements(myPosts.length);
            setTotalPages(Math.ceil(myPosts.length / POSTS_PER_PAGE));
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
        } catch (err) {
            console.error('Fehler beim Liken:', err);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Möchtest du diesen Post wirklich löschen?')) {
            return;
        }

        try {
            await PostService.deletePost(postId);
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            setTotalElements(prev => prev - 1);

            // Wenn letzte Karte auf der Seite gelöscht, zur vorherigen Seite
            if (posts.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                loadMyPosts();
            }
        } catch (err) {
            console.error('Fehler beim Löschen:', err);
            alert('Fehler beim Löschen des Posts');
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

    // Dialog Handlers
    const openCreateDialog = () => {
        setEditingPost(null);
        setFormData({ imageUrl: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (post: ImagePost) => {
        setEditingPost(post);
        setFormData({
            imageUrl: post.imageUrl,
            description: post.description || ''
        });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingPost(null);
        setFormData({ imageUrl: '', description: '' });
    };

    const handleFormChange = (field: keyof CreatePostData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.imageUrl.trim()) {
            alert('Bitte gib eine Bild-URL ein');
            return;
        }

        try {
            setSaving(true);

            if (editingPost) {
                // Update existing post
                await PostService.updatePost(editingPost.id, formData);
            } else {
                // Create new post
                await PostService.createPost(formData);
            }

            closeDialog();
            loadMyPosts();
        } catch (err: any) {
            console.error('Fehler beim Speichern:', err);
            alert(err.response?.data?.message || 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    // Loading Skeleton
    if (loading && posts.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        Meine Posts
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
                        <IconButton color="inherit" size="small" onClick={loadMyPosts}>
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
                <Person sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Meine Posts
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 3 }}>
                    {totalElements} {totalElements === 1 ? 'Bild' : 'Bilder'} von dir
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
            {posts.length === 0 && !loading ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4
                }}>
                    <PhotoLibrary sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary">
                        Du hast noch keine Posts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                        Erstelle deinen ersten Post!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateDialog}
                        sx={{
                            background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3
                        }}
                    >
                        Neuer Post
                    </Button>
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
                                    justifyContent: 'space-between',
                                    px: 2,
                                    pb: 2
                                }}>
                                    {/* Like Button */}
                                    <Tooltip title="Gefällt mir">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconButton
                                                onClick={() => handleLike(post.id)}
                                                sx={{
                                                    color: post.likeCount > 0 ? '#e91e63' : 'inherit',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                                                        transform: 'scale(1.1)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {post.likeCount > 0 ? (
                                                    <Favorite />
                                                ) : (
                                                    <FavoriteBorder />
                                                )}
                                            </IconButton>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight="medium"
                                            >
                                                {post.likeCount}
                                            </Typography>
                                        </Box>
                                    </Tooltip>

                                    {/* Edit & Delete Buttons */}
                                    <Box>
                                        <Tooltip title="Bearbeiten">
                                            <IconButton
                                                onClick={() => openEditDialog(post)}
                                                sx={{
                                                    color: '#1565c0',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(21, 101, 192, 0.1)'
                                                    }
                                                }}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Löschen">
                                            <IconButton
                                                onClick={() => handleDelete(post.id)}
                                                sx={{
                                                    color: '#999',
                                                    '&:hover': {
                                                        color: '#f44336',
                                                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                                    }
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
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
                        Seite {page} von {totalPages || 1} ({totalElements} Bilder)
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

            {/* Floating Action Button - Neuer Post */}
            <Fab
                color="primary"
                onClick={openCreateDialog}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)'
                    }
                }}
            >
                <Add />
            </Fab>

            {/* Create/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {editingPost ? 'Post bearbeiten' : 'Neuer Post'}
                    <IconButton onClick={closeDialog} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        label="Bild-URL"
                        fullWidth
                        value={formData.imageUrl}
                        onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                        placeholder="https://example.com/bild.jpg"
                        sx={{ mb: 3, mt: 1 }}
                        required
                    />
                    <TextField
                        label="Beschreibung"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Beschreibe dein Bild..."
                    />

                    {/* Preview */}
                    {formData.imageUrl && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Vorschau:
                            </Typography>
                            <Box
                                component="img"
                                src={formData.imageUrl}
                                alt="Preview"
                                sx={{
                                    width: '100%',
                                    maxHeight: 200,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    border: '1px solid #ddd'
                                }}
                                onError={(e: any) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialog} color="inherit">
                        Abbrechen
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.imageUrl.trim()}
                        sx={{
                            background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                            px: 4
                        }}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Speichern'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyPosts;
