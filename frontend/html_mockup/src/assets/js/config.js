/**
 * Admin Panel Configuration
 */

const AdminConfig = {
    // Site information
    site: {
        name: 'Admin Dashboard',
        logo: '/assets/images/logo.svg',
        version: '1.0.0',
    },
    
    // Navigation menu items
    navigation: [
        { id: 'dashboard', title: 'Dashboard', icon: 'tachometer-alt', url: '/dashboard' },
        { id: 'posts', title: 'Posts', icon: 'file-alt', url: '/posts', active: true },
        { id: 'users', title: 'Users', icon: 'users', url: '/users' },
        { id: 'comments', title: 'Comments', icon: 'comment', url: '/comments' },
        { id: 'settings', title: 'Settings', icon: 'cog', url: '/settings' }
    ],
    
    // Editor configuration
    editor: {
        tools: [
            { name: 'bold', tooltip: 'Bold', icon: 'bold' },
            { name: 'italic', tooltip: 'Italic', icon: 'italic' },
            { name: 'link', tooltip: 'Insert Link', icon: 'link' },
            { name: 'bulletList', tooltip: 'Bullet List', icon: 'list-ul' },
            { name: 'orderedList', tooltip: 'Ordered List', icon: 'list-ol' },
            { name: 'quote', tooltip: 'Quote', icon: 'quote-right' },
            { name: 'image', tooltip: 'Insert Image', icon: 'image' },
            { name: 'codeBlock', tooltip: 'Code Block', icon: 'code' }
        ],
        autosaveInterval: 30, // seconds
    },
    
    // Post settings
    posts: {
        categories: [
            'Technology', 
            'Design', 
            'Business', 
            'Marketing',
            'Development',
            'Lifestyle'
        ],
        statuses: [
            { value: 'published', label: 'Published', color: 'green' },
            { value: 'draft', label: 'Draft', color: 'gray' },
            { value: 'pending', label: 'Pending Review', color: 'yellow' },
            { value: 'private', label: 'Private', color: 'blue' },
            { value: 'trash', label: 'Trash', color: 'red' }
        ]
    },
    
    // API endpoints
    api: {
        posts: '/api/posts',
        users: '/api/users',
        comments: '/api/comments',
        media: '/api/media',
    },
    
    // User permissions
    permissions: {
        edit_posts: true,
        delete_posts: true,
        publish_posts: true,
        manage_users: true
    }
};

// Export the configuration
export default AdminConfig;
