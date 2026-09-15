document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch and render existing comments on load
    loadComments();

    // 2. Handle new top-level comment form submission
    const form = document.getElementById('comment-form');
    if (!form) return;

    // Create status message element dynamically under the submit button
    const submitButton = form.querySelector('button[type="submit"]');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'comment-status';
    submitButton.parentNode.insertBefore(statusDiv, submitButton.nextSibling);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawPath = window.location.pathname;
        const pageKey = btoa(rawPath);

        const payload = {
            page_key: pageKey,
            parent_id: null,
            author_name: document.getElementById('author-name').value.trim(),
            author_email: document.getElementById('author-email').value.trim(),
            body: document.getElementById('comment-body').value.trim()
        };

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.style.display = 'none'; // Hide while submitting
        statusDiv.textContent = '';

        try {
            const response = await fetch('/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                form.reset();
                await loadComments();
                statusDiv.textContent = 'Comment submitted successfully!';
                statusDiv.style.display = 'block'; // Reveal the block
            } else {
                const errData = await response.json();
                statusDiv.textContent = `Error: ${errData.error || 'Could not submit comment.'}`;
                statusDiv.style.display = 'block'; // Reveal the block
            }
        } catch (err) {
            console.error('Submission failed:', err);
            statusDiv.textContent = 'A network error occurred. Please try again.';
            statusDiv.style.display = 'block'; // Reveal the block
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Post Comment';
        }
    });

    // 3. Handle admin comment deletion via event delegation
    document.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.getAttribute('data-id');
            if (!confirm('Are you sure you want to delete this comment?')) return;

            const adminKey = localStorage.getItem('comment_admin_key');
            if (!adminKey) {
                alert('No admin key found in browser. Please set it using setCommentAdminKey("your_key") in the console.');
                return;
            }

            try {
                const response = await fetch(`/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-Admin-Key': adminKey
                    }
                });

                if (response.ok) {
                    await loadComments();
                } else {
                    const errData = await response.json();
                    alert(`Failed to delete: ${errData.error || 'Unauthorized'}`);
                }
            } catch (err) {
                console.error('Delete request failed:', err);
                alert('A network error occurred while trying to delete.');
            }
        }
    });
});

// Expose a helper in the console to easily set the admin key in localStorage
window.setCommentAdminKey = function(key) {
    localStorage.setItem('comment_admin_key', key);
    alert('Admin key saved to browser storage! Refreshing comments...');
    loadComments();
};

async function loadComments() {
    const container = document.getElementById('comments-list');
    if (!container) return;

    const rawPath = window.location.pathname;
    const pageKey = btoa(rawPath);
    const isAdmin = Boolean(localStorage.getItem('comment_admin_key'));

    try {
        const response = await fetch(`/comments?page_key=${encodeURIComponent(pageKey)}`);
        if (!response.ok) return;

        const allComments = await response.json();

        if (allComments.length === 0) {
            container.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        // Separate top-level comments and replies
        const topLevel = allComments.filter(c => !c.parent_id);
        const replies = allComments.filter(c => c.parent_id);

        container.innerHTML = topLevel.map(c => {
            const childReplies = replies.filter(r => r.parent_id === c.id);
            return renderCommentNode(c, childReplies, isAdmin);
        }).join('');
    } catch (err) {
        console.error('Failed to load comments:', err);
        container.innerHTML = '<p class="comment-error">Could not load comments at this time.</p>';
    }
}

function renderCommentNode(c, replies, isAdmin) {
    return `
        <div class="comment-thread" data-id="${c.id}">
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(c.author_name)}</span>
                    <span class="comment-date">${formatDate(c.created_at)}</span>
                </div>
                <div class="comment-body">
                    <p>${escapeHtml(c.body.trim())}</p>
                    <div class="comment-actions">
                        <button class="reply-toggle-btn" onclick="toggleReplyForm(${c.id})">Reply</button>
                        ${isAdmin ? `<button class="delete-comment-btn" data-id="${c.id}">Delete Comment</button>` : ''}
                    </div>
                </div>
            </div>

            <div class="replies-container">
                ${replies.map(r => `
                    <div class="comment-item reply-item">
                        <div class="comment-header reply-header">
                            <span class="comment-author">${escapeHtml(r.author_name)}</span>
                            <span class="comment-date">${formatDate(r.created_at)}</span>
                        </div>
                        <div class="comment-body reply-body">
                            <p>${escapeHtml(r.body.trim())}</p>
                            ${isAdmin ? `<div class="comment-actions"><button class="delete-comment-btn" data-id="${r.id}">Delete Comment</button></div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <form class="reply-form" id="reply-form-${c.id}" style="display:none;" onsubmit="submitReply(event, ${c.id})">
                <h5>Leave a Reply</h5>
                <div class="field-group">
                    <label>Name *</label>
                    <input type="text" class="reply-name" required maxlength="50">
                </div>
                <div class="field-group">
                    <label>Email (optional)</label>
                    <input type="email" class="reply-email">
                </div>
                <div class="field-group">
                    <label>Reply *</label>
                    <textarea class="reply-body-input" rows="3" required maxlength="1000"></textarea>
                </div>
                <button type="submit" class="submit-reply-btn">Post Reply</button>
            </form>
        </div>
    `;
}

window.toggleReplyForm = function(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.submitReply = async function(e, parentId) {
    e.preventDefault();
    const form = e.target;
    const rawPath = window.location.pathname;
    const pageKey = btoa(rawPath);

    const payload = {
        page_key: pageKey,
        parent_id: parentId,
        author_name: form.querySelector('.reply-name').value.trim(),
        author_email: form.querySelector('.reply-email').value.trim(),
        body: form.querySelector('.reply-body-input').value.trim()
    };

    try {
        const response = await fetch('/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            await loadComments();
        } else {
            alert('Could not post reply.');
        }
    } catch (err) {
        console.error('Reply submission failed:', err);
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'Z'); // Treat as UTC
    return isNaN(date) ? dateString : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
