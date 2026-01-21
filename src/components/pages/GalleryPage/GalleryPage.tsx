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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Snackbar
} from '@mui/material';
import {
    CalendarToday,
    PhotoLibrary,
    Person,
    SortRounded,
    FilterList,
    Add,
    Edit,
    Delete,
    Close
} from '@mui/icons-material';
import PostService, { ImagePost, CreatePostData } from '../../../Services/PostService';
import UserService from '../../../Services/UserService';
import { User } from '../../../types/models/User.model';
import ActiveUserContext from '../../../Contexts/ActiveUserContext';

const POSTS_PER_PAGE = 12;
const DESCRIPTION_PREVIEW_LENGTH = 73;

// Sortierungs-Optionen
type SortOption = 'createdAt,desc' | 'createdAt,asc' | 'likes,desc' | 'likes,asc';

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
    const { user, checkRole } = useContext(ActiveUserContext);
    const isAdmin = checkRole('ADMIN');

    const [posts, setPosts] = useState<ImagePost[]>([]);
    const [allPosts, setAllPosts] = useState<ImagePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

    // Sortierung und Filter State
    const [sortOption, setSortOption] = useState<SortOption>('createdAt,desc');
    const [authorFilter, setAuthorFilter] = useState<string>('all');
    const [authors, setAuthors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

    // Dialog State (für Admin CRUD)
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ImagePost | null>(null);
    const [formData, setFormData] = useState<CreatePostData>({
        imageUrl: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    // Delete Confirmation Dialog State
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        postId: string | null;
    }>({ open: false, postId: null });

    // Form Validation State
    const [formErrors, setFormErrors] = useState<{
        imageUrl: string;
        description: string;
    }>({ imageUrl: '', description: '' });

    const MAX_DESCRIPTION_LENGTH = 200;

    // Aktueller Tab basierend auf URL (nur für User relevant)
    const currentTab = location.pathname === '/gallery/my-posts' ? 1 : 0;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 0) {
            navigate('/gallery');
        } else {
            navigate('/gallery/my-posts');
        }
    };

    // Lade alle Posts und Autoren einmalig
    useEffect(() => {
        loadAllPostsAndAuthors();
    }, []);

    // Lade Posts bei Änderung von Seite, Sortierung oder Filter
    useEffect(() => {
        loadPosts();
    }, [page, sortOption, authorFilter, allPosts]);

    // Handler für Sortierung und Filter
    const handleSortChange = (event: SelectChangeEvent) => {
        setSortOption(event.target.value as SortOption);
        setPage(1);
    };

    const handleAuthorFilterChange = (event: SelectChangeEvent) => {
        setAuthorFilter(event.target.value);
        setPage(1);
    };

    const loadAllPostsAndAuthors = async () => {
        try {
            // Lade alle Posts
            const postsResponse = await PostService.getAllPosts({
                page: 0,
                size: 1000,
                sort: 'createdAt,desc'
            });
            const allPostsData = postsResponse.data.content;
            setAllPosts(allPostsData);

            // Lade alle Benutzer
            const usersResponse = await UserService.getAllUsers();
            const allUsers: User[] = usersResponse.data;

            // Extrahiere eindeutige Autor-IDs aus Posts
            const uniqueAuthorIds = [...new Set(allPostsData.map(post => post.authorId))];

            // Mappe Autor-IDs zu Benutzernamen
            const authorsWithNames = uniqueAuthorIds
                .map(authorId => {
                    const user = allUsers.find(u => u.id === authorId);
                    if (user) {
                        return {
                            id: authorId,
                            firstName: user.firstName,
                            lastName: user.lastName
                        };
                    }
                    return null;
                })
                .filter((author): author is { id: string; firstName: string; lastName: string } => author !== null)
                .sort((a, b) => a.lastName.localeCompare(b.lastName));

            setAuthors(authorsWithNames);
        } catch (err) {
            console.error('Fehler beim Laden der Autoren:', err);
        }
    };

    const sortPosts = (postsToSort: ImagePost[], sort: SortOption): ImagePost[] => {
        const sorted = [...postsToSort];
        switch (sort) {
            case 'createdAt,desc':
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'createdAt,asc':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'likes,desc':
                return sorted.sort((a, b) => ((b as any).likes || 0) - ((a as any).likes || 0));
            case 'likes,asc':
                return sorted.sort((a, b) => ((a as any).likes || 0) - ((b as any).likes || 0));
            default:
                return sorted;
        }
    };

    const loadPosts = async () => {
        try {
            setLoading(true);

            // Wenn nach Autor gefiltert wird, filtern wir im Frontend
            if (authorFilter !== 'all') {
                const filteredPosts = allPosts.filter(post => post.authorId === authorFilter);
                const sortedPosts = sortPosts(filteredPosts, sortOption);
                const startIndex = (page - 1) * POSTS_PER_PAGE;
                const paginatedPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

                setPosts(paginatedPosts);
                setTotalElements(filteredPosts.length);
                setTotalPages(Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
            } else {
                // Ohne Autor-Filter: Backend-Pagination nutzen
                const response = await PostService.getAllPosts({
                    page: page - 1,
                    size: POSTS_PER_PAGE,
                    sort: sortOption
                });

                const pageData = response.data;
                setPosts(pageData.content);
                setTotalPages(pageData.totalPages);
                setTotalElements(pageData.totalElements);
            }
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

    const toggleDescription = (postId: string) => {
        setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Admin CRUD Handlers
    const openCreateDialog = () => {
        setEditingPost(null);
        setFormData({ imageUrl: '', description: '' });
        setFormErrors({ imageUrl: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (post: ImagePost) => {
        setEditingPost(post);
        setFormData({
            imageUrl: post.imageUrl,
            description: post.description || ''
        });
        setFormErrors({ imageUrl: '', description: '' });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingPost(null);
        setFormData({ imageUrl: '', description: '' });
        setFormErrors({ imageUrl: '', description: '' });
    };

    const openDeleteDialog = (postId: string) => {
        setDeleteDialog({ open: true, postId });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({ open: false, postId: null });
    };

    const isValidUrl = (url: string): boolean => {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateForm = (): boolean => {
        const errors = { imageUrl: '', description: '' };
        let isValid = true;

        if (!formData.imageUrl.trim()) {
            errors.imageUrl = 'Bild-URL ist ein Pflichtfeld';
            isValid = false;
        } else if (!isValidUrl(formData.imageUrl.trim())) {
            errors.imageUrl = 'Bitte gib eine gültige URL ein (z.B. https://example.com/bild.jpg)';
            isValid = false;
        }

        if ((formData.description || '').length > MAX_DESCRIPTION_LENGTH) {
            errors.description = `Beschreibung darf maximal ${MAX_DESCRIPTION_LENGTH} Zeichen lang sein`;
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleFormChange = (field: keyof CreatePostData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            if (editingPost) {
                await PostService.updatePost(editingPost.id, formData);
                setSnackbar({ open: true, message: 'Post erfolgreich aktualisiert', severity: 'success' });
            } else {
                await PostService.createPost(formData);
                setSnackbar({ open: true, message: 'Post erfolgreich erstellt', severity: 'success' });
            }

            closeDialog();
            loadAllPostsAndAuthors();
            loadPosts();
        } catch (err: any) {
            console.error('Fehler beim Speichern:', err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Fehler beim Speichern', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteDialog.postId) return;

        try {
            await PostService.deletePost(deleteDialog.postId);
            setPosts(prevPosts => prevPosts.filter(post => post.id !== deleteDialog.postId));
            setAllPosts(prevPosts => prevPosts.filter(post => post.id !== deleteDialog.postId));
            setTotalElements(prev => prev - 1);
            setSnackbar({ open: true, message: 'Post erfolgreich gelöscht', severity: 'success' });

            if (posts.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (err) {
            console.error('Fehler beim Löschen:', err);
            setSnackbar({ open: true, message: 'Fehler beim Löschen des Posts', severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getAuthorName = (authorId: string) => {
        const author = authors.find(item => item.id === authorId);
        if (!author) {
            return 'Unbekannt';
        }
        return `${author.firstName} ${author.lastName}`.trim();
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

                {/* Navigation Tabs - nur für User, Admin sieht nur "Posts" */}
                {!isAdmin ? (
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
                ) : (
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                        Admin-Ansicht: Alle Posts verwalten
                    </Typography>
                )}
            </Box>

            {/* Filter und Sortierung */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Sortierung */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="sort-label">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SortRounded fontSize="small" />
                            Sortierung
                        </Box>
                    </InputLabel>
                    <Select
                        labelId="sort-label"
                        value={sortOption}
                        label="Sortierung"
                        onChange={handleSortChange}
                    >
                        <MenuItem value="createdAt,desc">Neueste zuerst</MenuItem>
                        <MenuItem value="createdAt,asc">Älteste zuerst</MenuItem>
                        <MenuItem value="likes,desc">Meiste Likes</MenuItem>
                        <MenuItem value="likes,asc">Wenigste Likes</MenuItem>
                    </Select>
                </FormControl>

                {/* Autor-Filter */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="author-filter-label">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FilterList fontSize="small" />
                            Nach Autor filtern
                        </Box>
                    </InputLabel>
                    <Select
                        labelId="author-filter-label"
                        value={authorFilter}
                        label="Nach Autor filtern"
                        onChange={handleAuthorFilterChange}
                    >
                        <MenuItem value="all">Alle Autoren</MenuItem>
                        {authors.map(author => (
                            <MenuItem key={author.id} value={author.id}>
                                {author.firstName} {author.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Aktiver Filter Chip */}
                {authorFilter !== 'all' && (
                    <Chip
                        label={`Filter: ${(() => {
                            const author = authors.find(a => a.id === authorFilter);
                            return author ? `${author.firstName} ${author.lastName}` : 'Autor';
                        })()}`}
                        onDelete={() => setAuthorFilter('all')}
                        color="primary"
                        variant="outlined"
                    />
                )}
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
                        {posts.map((post, index) => {
                            const descriptionText = post.description || 'Keine Beschreibung';
                            const isLong = descriptionText.length > DESCRIPTION_PREVIEW_LENGTH;
                            const isExpanded = Boolean(expandedPosts[post.id]);
                            const visibleDescription = isExpanded || !isLong
                                ? descriptionText
                                : `${descriptionText.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`;

                            return (
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
                                                display: isExpanded ? 'block' : '-webkit-box',
                                                WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                WebkitBoxOrient: 'vertical',
                                                minHeight: 40,
                                                whiteSpace: isExpanded ? 'normal' : 'unset'
                                            }}
                                        >
                                            {visibleDescription}
                                        </Typography>
                                        {isLong && (
                                            <Button
                                                size="small"
                                                onClick={() => toggleDescription(post.id)}
                                                sx={{ mt: 0.5, px: 0, minWidth: 'auto', textTransform: 'none' }}
                                            >
                                                {isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                                            </Button>
                                        )}

                                        {/* Date Chip */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            <Chip
                                                icon={<CalendarToday sx={{ fontSize: 14 }} />}
                                                label={formatDate(post.createdAt)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: 11 }}
                                            />
                                            <Tooltip title={`Autor: ${getAuthorName(post.authorId)}`}>
                                                <Chip
                                                    icon={<Person sx={{ fontSize: 14 }} />}
                                                    label={getAuthorName(post.authorId)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: 11 }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </CardContent>

                                    {/* Actions */}
                                    <CardActions sx={{
                                        justifyContent: isAdmin ? 'space-between' : 'flex-start',
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

                                        {/* Admin Edit & Delete Buttons */}
                                        {isAdmin && (
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
                                                        onClick={() => openDeleteDialog(post.id)}
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
                                        )}
                                    </CardActions>
                                </Card>
                            );
                        })}
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

                    {/* Date Chip */}
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                    >
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 14 }} />}
                        label={formatDate(post.createdAt)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                      <Tooltip title={`Autor: ${getAuthorName(post.authorId)}`}>
                        <Chip
                          icon={<Person sx={{ fontSize: 14 }} />}
                          label={getAuthorName(post.authorId)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11 }}
                        />
                      </Tooltip>
                    </Box>
                  </CardContent>

            {/* Admin: Create/Edit Dialog */}
            {isAdmin && (
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
                            onChange={(e) => {
                                handleFormChange('imageUrl', e.target.value);
                                if (formErrors.imageUrl) {
                                    setFormErrors(prev => ({ ...prev, imageUrl: '' }));
                                }
                            }}
                            placeholder="https://example.com/bild.jpg"
                            sx={{ mb: 3, mt: 1 }}
                            required
                            error={!!formErrors.imageUrl}
                            helperText={formErrors.imageUrl}
                        />
                        <TextField
                            label="Beschreibung"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => {
                                handleFormChange('description', e.target.value);
                                if (formErrors.description) {
                                    setFormErrors(prev => ({ ...prev, description: '' }));
                                }
                            }}
                            placeholder="Beschreibe das Bild..."
                            error={!!formErrors.description}
                            helperText={formErrors.description || `${(formData.description || '').length}/${MAX_DESCRIPTION_LENGTH} Zeichen`}
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
            )}

            {/* Admin: Delete Confirmation Dialog */}
            {isAdmin && (
                <Dialog
                    open={deleteDialog.open}
                    onClose={closeDeleteDialog}
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1 }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        Post löschen?
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary">
                            Bist du sicher, dass du diesen Post löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={closeDeleteDialog} color="inherit">
                            Abbrechen
                        </Button>
                        <Button
                            variant="contained"
                            onClick={confirmDelete}
                            color="error"
                            sx={{ px: 3 }}
                        >
                            Löschen
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Snackbar für Benachrichtigungen */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GalleryPage;
