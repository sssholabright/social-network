const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

async function handleResponse(response) {
    console.log('Response:', response);
    console.log('Response type:', typeof response);
    console.log('Response properties:', Object.keys(response));

    if (typeof response === 'object' && response !== null) {
        if (response.ok === false) {
            const errorMessage = response.detail || response.message || 'An error occurred';
            console.error('API Error:', errorMessage);
            throw new Error(errorMessage);
        }
        return response;
    }

    if (!response || !response.ok) {
        const errorMessage = await response.text();
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage || response.statusText);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        console.error('Unexpected content type:', contentType);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Unexpected response format');
    }
}

function getCsrfToken() {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
    console.log('CSRF Token:', csrfToken);  // Add this line
    return csrfToken;
}

async function ensureCsrfCookie() {
    await fetch(`${API_URL}/csrf/`, {
        credentials: 'include',
    });
}


async function authFetch(url, options = {}) {
    const headers = {
        ...options.headers
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const csrfToken = getCsrfToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }

    console.log('Request headers:', headers);  // Add this line

    const response = await fetch(`${API_URL}${url}`, { 
        ...options, 
        headers,
        credentials: 'include'
    });

    return handleResponse(response);
}

const api = {
    // Auth 
    login: async (username, password) => {
        return authFetch('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    register: async (username, email, password) => {
        await ensureCsrfCookie();
        return authFetch('/auth/register/', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    },
    logout: () => {
        return authFetch('/auth/logout/', { method: 'POST' })
    },

    // User
    getProfile: async (profileId) => {
        const response = await authFetch(`/profiles/${profileId}/`)
        return handleResponse(response)
    },

    updateProfile: async (profileId, profileData) => {
        const response = await authFetch(`/profiles/${profileId}/`, {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        })
        return handleResponse(response)
    },

    followProfile: async (profileId) => {
        const response = await authFetch(`/profiles/${profileId}/follow/`, {
            method: 'POST'
        })
        return handleResponse(response)
    },

    unfollowProfile: async (profileId) => {
        const response = await authFetch(`/profiles/${profileId}/unfollow/`, {
            method: 'POST'
        })
        return handleResponse(response)
    },

    // Posts
    getPosts: async (page = 1) => {
        const response = await authFetch(`/posts/?page=${page}`);
        console.log('Raw getPosts response:', response);
        return response;
    },

    createPost: async (postData) => {
        console.log('Sending post data:', postData); 
        const formData = new FormData()
        formData.append('caption', postData.caption)
        if (postData.image) {
            formData.append('image', postData.image)
        }
    
        const response = await authFetch('/posts/', {
            method: 'POST',
            headers: {},  // Remove any Content-Type header
            body: formData
        })
        console.log('Raw createPost response:', response);
        return handleResponse(response)
    },

    getPost: async (postId) => {
        const response = await authFetch(`/posts/${postId}/`)
        return handleResponse(response)
    },

    updatePost: async (postId, postData) => {
        const response = await authFetch(`/posts/${postId}/`, {
            method: 'PATCH',
            body: JSON.stringify(postData)
        })
        return handleResponse(response)
    },

    deletePost: async (postId) => {
        const response = await authFetch(`/posts/${postId}/`, {
            method: 'DELETE'
        })
        return handleResponse(response)
    },

    likePost: async (postId) => {
        const response = await authFetch(`/posts/${postId}/like/`, {
            method: 'POST'
        })
        return handleResponse(response)
    },

    unlikePost: async (postId) => {
        const response = await authFetch(`/posts/${postId}/unlike/`, {
            method: 'POST'
        })
        return handleResponse(response)
    },

    // Comments
    getComments: async (postId) => {
        const response = await authFetch(`/comments/?post=${postId}`)
        return handleResponse(response)
    },

    createComment: async (postId, content) => {
        const response = await authFetch(`/comments/`, {
            method: 'POST',
            body: JSON.stringify({ post: postId, content })
        })
        return handleResponse(response)
    },

    deleteComment: async (commentId) => {
        const response = await authFetch(`/comments/${commentId}/`, {
            method: 'DELETE'
        })
        return handleResponse(response)
    },

    // Messages
    getMessages: async () => {
        const response = await authFetch(`/messages/`)
        return handleResponse(response)
    },

    sendMessage: async (recipientId, content) => {
        const response = await authFetch(`/messages/`, {
            method: 'POST',
            body: JSON.stringify({ recipient: recipientId, content })
        })
        return handleResponse(response)
    },

    // Additional utility functions
    getCurrentUser: async () => {
        return authFetch(`/auth/user/`)
    },

    searchUsers: async (query) => {
        const response = await authFetch(`/profiles/?search=${query}`)
        return handleResponse(response)
    },
}

export default api
