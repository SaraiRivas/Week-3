class ApiClient {
    static instance = null;

    constructor() {
        if (ApiClient.instance) {
            return ApiClient.instance;
        }

        this.baseUrl = "";
        ApiClient.instance = this;
    }

    async get(url) {
        return this.request(url, "GET");
    }

    async post(url, data) {
        return this.request(url, "POST", data);
    }

    async delete(url) {
        return this.request(url, "DELETE");
    }

    async patch(url, data) {
        return this.request(url, "PATCH", data);
    }

    async request(url, method, data = null) {
        const requestOptions = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (data) {
            requestOptions.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}/${url}`, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error("Error making request:", error);
            throw error;
        }
    }
}

let data;
let tagsDropdown;
const apiClient = new ApiClient();

document.addEventListener("DOMContentLoaded", async function () {
    let addCommentButtons;

    const dropdownBtn = document.getElementById("dropdownBtn");
    tagsDropdown = document.getElementById("tags-dropdown");
    const postsContainer = document.getElementById("posts-container");
    const remainingPostsContainer = document.getElementById(
        "remaining-posts-container"
    );
    const searchInput = document.getElementById("searchInput");
    const searchResult = document.getElementById("searchResult");

    try {
        data = await fetchData("./db.json");
        initializePage();
    } catch (error) {
        console.error("Error initializing page:", error);
    }

    function fetchData(url) {
        return apiClient.get(url);
    }

    function initializePage() {
        loadTagsDropdown();
        loadPosts(data.posts, postsContainer);
        loadPosts(data.remainingPosts, remainingPostsContainer);
        setupSearch();
    }
});

document.addEventListener("click", function (event) {
    const isDropdownBtn = event.target.matches('.dropdownBtn') || event.target.closest('.dropdownBtn');
    const isTagsDropdown = event.target.matches('.tags-dropdown') || event.target.closest('.tags-dropdown');

    if (!isDropdownBtn && !isTagsDropdown) {
        tagsDropdown.classList.remove("show");
    }
});

dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    tagsDropdown.classList.toggle("show");
});

function updateCommentsCount(postId, commentsCount) {
    const commentsCountElement = document.querySelector(
        `.comments-count[data-post-id="${postId}"]`
    );
    if (commentsCountElement) {
        commentsCountElement.textContent = commentsCount;
    } else {
        console.error(`Comments count element not found for postId: ${postId}`);
    }
}

function loadTagsDropdown() {
    tagsDropdown.innerHTML = "";
    const dropdownContent = document.createElement("div");
    dropdownContent.classList.add("dropdown-content");

    data.tags.forEach((tag) => {
        const tagElement = createTagElement(tag);
        dropdownContent.appendChild(tagElement);
    });

    dropdownBtn.addEventListener("click", () => {
        dropdownContent.classList.toggle("show");
    });


    tagsDropdown.appendChild(dropdownContent);
}

function createTagElement(tag) {
    const tagElement = document.createElement("div");
    tagElement.classList.add("tag");
    tagElement.textContent = tag.name;

    tagElement.addEventListener("click", () => {
        filterByTag(tag.name);
        tagsDropdown.querySelector(".dropdown-content").classList.remove("show");
    });

    return tagElement;
}

function loadPosts(posts, container) {
    container.innerHTML = "";
    posts.reverse().forEach((post) => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    const likesCountElement = createLikesCountElement(post);
    const imgElement = createImageElement(post);
    const postDetails = createPostDetailsElement(post, likesCountElement);

    postElement.appendChild(imgElement);
    postElement.appendChild(postDetails);

    addPostDetails(post, postElement);

    return postElement;
}

function createLikesCountElement(post) {
    const likesCountElement = document.createElement("span");
    likesCountElement.classList.add("likes-count");
    likesCountElement.dataset.postId = post.id;
    likesCountElement.textContent = post.likes || 0;
    return likesCountElement;
}

function createImageElement(post) {
    const imgElement = document.createElement("img");
    imgElement.src = post.image;
    return imgElement;
}

function createPostDetailsElement(post, likesCountElement) {
    const postDetails = document.createElement("div");
    postDetails.classList.add("post-details");

    const commentsCountElement = createCommentsCountElement(post);
    const commentsContainer = createCommentsContainer(post);
    const commentForm = createCommentForm(post);

    postDetails.innerHTML = `
        <h2 class="post-title">${post.title}</h2>
        <h3 class="post-subTitle">${post.subTitle}</h3>
        
        <p class="p.body">${post.body}</p>
        <div class="tags">${post.tags
            .map((tagId) => `<span class="tag">${getTagName(tagId)}</span>`)
            .join(", ")}</div>
        <p class="author"><strong>Author:</strong> ${getAuthorName(post.author)}</p>
        <p><strong class="date">Date:</strong> ${post.createDate}</p>
        <p><strong class="likes">Likes:</strong> ${likesCountElement.outerHTML}</p>
        <p><strong class="comments">Comments:</strong> ${commentsCountElement.outerHTML}</p>
        <button class="like-button" data-post-id="${post.id}">Like</button>
        <button class="comment-button" data-post-id="${post.id
        }">Comment</button>
        <div class="comments-section" id="post-comments-section-${post.id}">
            ${commentsContainer.outerHTML}
            ${commentForm.outerHTML}
        </div>
    `;

    return postDetails;
}

function createCommentsCountElement(post) {
    const commentsCountElement = document.createElement("span");
    commentsCountElement.classList.add("comments-count");
    commentsCountElement.dataset.postId = post.id;
    commentsCountElement.textContent = post.comments ? post.comments.length : 0;
    return commentsCountElement;
}

function createCommentsContainer(post) {
    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("post-comments");
    commentsContainer.id = `post-comments-list-${post.id}`;
    commentsContainer.style.display = "none";
    return commentsContainer;
}

function createCommentForm(post) {
    const commentForm = document.createElement("form");
    commentForm.classList.add("comment-form");
    commentForm.id = `commentForm-${post.id}`;
    commentForm.style.display = "none";

    commentForm.innerHTML = `
        <label for="commentName-${post.id}">Name:</label>
        <input type="text" id="commentName-${post.id}" placeholder="Your name...">
        <label for="commentText-${post.id}">Comment:</label>
        <textarea id="commentText-${post.id}" placeholder="Your comment..."></textarea>
        <button type="button" class="add-comment-button" data-post-id="${post.id}">Add Comment</button>
        <div id="nameErrorMessage-${post.id}"></div>
    `;

    return commentForm;
}

function addPostDetails(post, postElement) {
    const commentsCountElement = postElement.querySelector(".comments-count");
    const likeButton = postElement.querySelector(".like-button");
    const commentButton = postElement.querySelector(".comment-button");
    const addCommentButton = postElement.querySelector(".add-comment-button");
    const commentsSection = postElement.querySelector(".comments-section");

    likeButton.addEventListener("click", () => handleLike(post.id));
    commentButton.addEventListener("click", () =>
        loadCommentsAndToggleForm(post.id)
    );
    addCommentButton.addEventListener("click", () =>
        addComment(post.id, commentsCountElement)
    );

    if (post.comments && post.comments.length > 0) {
        loadComments(post.id, commentsSection);
    }
}

function setupSearch() {
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim();
        if (searchTerm.length > 0) {
            displaySearchResults(searchTerm);
        } else {
            searchResult.innerHTML = "";
        }
    });
}

function getTagName(tagId) {
    const tag = data.tags.find((tag) => tag.id === tagId);
    return tag ? tag.name : "";
}

function getAuthorName(authorId) {
    const author = data.authors.find((author) => author.id === authorId);
    return author ? `${author.name} ${author.lastName}` : "";
}

function filterByTag(tagName) {
    const postsContainer = document.getElementById("posts-container");

    const filteredPosts = data.posts.filter((post) =>
        post.tags.includes(getTagId(tagName))
    );
    loadPosts(filteredPosts, postsContainer);
}

function getTagId(tagName) {
    const tag = data.tags.find((tag) => tag.name === tagName);
    return tag ? tag.id : null;
}

function displaySearchResults(searchTerm) {
    const searchResults = data.posts
        .concat(data.remainingPosts)
        .filter((post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (searchResults.length > 0) {
        loadPosts(searchResults, searchResult);
    } else {
        searchResult.innerHTML = "Search does not match any title.";
    }
}

function handleLike(postId) {
    const post = findPostById(postId);

    if (post) {
        const likeButton = document.querySelector(
            `.like-button[data-post-id="${postId}"]`
        );

        if (likeButton && !likeButton.disabled) {
            if (post.likes === undefined) {
                post.likes = 1;
            } else if (post.likes >= 0) {
                post.likes += 1;
            }

            updateLikesCount(postId, post.likes);
            updateCommentsCount(postId, post.comments ? post.comments.length : 0);
            likeButton.disabled = true;
        } else {
            console.log("Like button not found or already disabled.");
        }
    } else {
        console.error(`Post not found: ${postId}`);
    }
}

function loadCommentsAndToggleForm(postId) {
    const commentsSection = document.getElementById(
        `post-comments-section-${postId}`
    );
    if (commentsSection) {
        const commentForm = document.getElementById(`commentForm-${postId}`);
        if (commentForm) {
            loadComments(postId, commentsSection);
            commentForm.style.display =
                commentForm.style.display === "none" ? "block" : "none";
        } else {
            console.error(`Comment form not found for postId: ${postId}`);
        }
    } else {
        console.error(`Comments section not found for postId: ${postId}`);
    }
}

function editComment(postId, commentIndex, originalCommentText) {
    const post = findPostById(postId);

    if (post && post.comments && post.comments.length > commentIndex) {
        const editedComment = prompt("Edit the comment:", originalCommentText);

        if (editedComment !== null) {
            post.comments[commentIndex].text = editedComment;
            updateComments(postId, post.comments);
        }
    } else {
        console.error(
            `Invalid post or comment index: postId=${postId}, commentIndex=${commentIndex}`
        );
    }
}

async function deleteComment(postId, commentIndex) {
    const post = findPostById(postId);

    if (post && post.comments && post.comments.length > commentIndex) {
        post.comments.splice(commentIndex, 1);
        updateComments(postId, post.comments);
        updateCommentsCount(postId, post.comments.length); 
    } else {
        console.error(
            `Invalid post or comment index: postId=${postId}, commentIndex=${commentIndex}`
        );
    }
}

function updateComments(postId, updatedComments) {
    const commentsSection = document.getElementById(
        `post-comments-section-${postId}`
    );
    if (commentsSection) {
        commentsSection.innerHTML = "";
        updatedComments.forEach((comment, index) => {
            const commentElement = createCommentElement(postId, index, comment);
            commentsSection.appendChild(commentElement);
        });
    } else {
        console.error(`Comments section not found for postId: ${postId}`);
    }
}

async function saveData(url, data, method = "POST") {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error saving data:", error);
        throw error;
    }
}

async function loadData() {
    try {
        const storedData = localStorage.getItem("your_data_key");
        return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
        console.error("Error loading data:", error);
        throw error;
    }
}

function toggleCommentForm(postId) {
    const commentForm = document.getElementById(`commentForm-${postId}`);
    if (commentForm) {
        commentForm.style.display =
            commentForm.style.display === "none" ? "block" : "none";
    } else {
        console.error(`Comment form not found for postId: ${postId}`);
    }
}

function loadComments(postId, commentsSection) {
    const commentsContainer = commentsSection.querySelector(".post-comments");
    const post = findPostById(postId);

    if (commentsContainer) {
        commentsContainer.innerHTML = "";

        if (post && post.comments && post.comments.length > 0) {
            post.comments.forEach((comment, index) => {
                const commentElement = createCommentElement(postId, index, comment);
                commentsContainer.appendChild(commentElement);
            });
        }
    } else {
        console.error(`Comments container not found for postId: ${postId}`);
    }
}

function createCommentElement(postId, commentIndex, comment) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");

    const commentText = document.createElement("p");
    commentText.textContent = `${comment.name}: ${comment.text}`;
    commentElement.appendChild(commentText);

    const deleteButton = createButton("Delete", () =>
        deleteComment(postId, commentIndex)
    );
    const editButton = createButton("Edit", () =>
        editComment(postId, commentIndex, comment.text)
    );

    commentElement.appendChild(deleteButton);
    commentElement.appendChild(editButton);

    return commentElement;
}

function createButton(text, onClick) {
    const button = document.createElement("a");
    button.href = "javascript:void(0)";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
}

function addComment(postId, commentsCountElement) {
    const post = findPostById(postId);

    if (post) {
        const commentNameElement = document.getElementById(
            `commentName-${post.id}`
        );
        const commentTextElement = document.getElementById(
            `commentText-${post.id}`
        );
        const commentsSection = document.getElementById(
            `post-comments-section-${post.id}`
        );
        const commentForm = document.getElementById(`commentForm-${post.id}`);

        if (
            commentNameElement &&
            commentTextElement &&
            commentsSection &&
            commentForm
        ) {
            const commentName = commentNameElement.value.trim();
            const commentText = commentTextElement.value.trim();

            if (commentName && commentText) {
                const newComment = { name: commentName, text: commentText };

                if (!post.comments) {
                    post.comments = [];
                }

                post.comments.unshift(newComment);
                commentsCountElement.textContent = post.comments.length;
                commentNameElement.value = "";
                commentTextElement.value = "";
                loadComments(postId, commentsSection);

                const newCommentElement = createCommentElement(postId, 0, newComment);
                commentsSection.insertBefore(
                    newCommentElement,
                    commentsSection.firstChild
                );
            } else {
                console.error("Name and comment text are required.");
            }
        } else {
            console.error(
                `Comment form elements or comments section not found for postId: ${postId}`
            );
        }
    } else {
        console.error(`Post not found: ${postId}`);
    }
}

function updateLikesCount(postId, likes) {
    const likesCountElement = document.querySelector(
        `.likes-count[data-post-id="${postId}"]`
    );
    if (likesCountElement) {
        likesCountElement.textContent = likes;
    } else {
        console.error(`Likes count element not found for postId: ${postId}`);
    }
}

function findPostById(postId) {
    const post =
        (data && data.posts
            ? data.posts.find((post) => post.id === postId)
            : null) ||
        (data && data.remainingPosts
            ? data.remainingPosts.find((post) => post.id === postId)
            : null);

    return post;
}
