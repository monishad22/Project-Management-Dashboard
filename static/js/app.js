const API_URL = "/api/products";

let products = [];
let currentProductId = null;
let currentPage = 1;
let inventoryChart = null;

const token =
    localStorage.getItem(
        "stockpilot_token"
    );


// ============================================================
// AUTH CHECK
// ============================================================

if (!token) {

    window.location.href = "/";

}


// ============================================================
// DOM
// ============================================================

const productsTableBody =
    document.getElementById(
        "productsTableBody"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const sortFilter =
    document.getElementById(
        "sortFilter"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

const productModalTitle =
    document.getElementById(
        "productModalTitle"
    );

const productId =
    document.getElementById(
        "productId"
    );

const productName =
    document.getElementById(
        "productName"
    );

const productCategory =
    document.getElementById(
        "productCategory"
    );

const productPrice =
    document.getElementById(
        "productPrice"
    );

const productStock =
    document.getElementById(
        "productStock"
    );

const productDescription =
    document.getElementById(
        "productDescription"
    );

const formError =
    document.getElementById(
        "formError"
    );

const detailsModal =
    document.getElementById(
        "detailsModal"
    );

const productDetails =
    document.getElementById(
        "productDetails"
    );

const attentionGrid =
    document.getElementById(
        "attentionGrid"
    );

const pagination =
    document.getElementById(
        "pagination"
    );


// ============================================================
// INIT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        loadUser();

        setupListeners();

        await loadProducts();

        await loadStatistics();

        await loadCategories();

    }
);


// ============================================================
// API HEADERS
// ============================================================

function authHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${localStorage.getItem(
                "stockpilot_token"
            )}`

    };

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupListeners() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            debounce(
                function () {

                    currentPage = 1;

                    loadProducts();

                },
                300
            )
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                loadProducts();

            }
        );

    }


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                loadProducts();

            }
        );

    }

}


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    try {

        const params =
            new URLSearchParams();


        const search =
            searchInput
                ? searchInput.value.trim()
                : "";


        const category =
            categoryFilter
                ? categoryFilter.value
                : "all";


        const sort =
            sortFilter
                ? sortFilter.value
                : "";


        params.append(
            "page",
            currentPage
        );

        params.append(
            "per_page",
            8
        );


        if (search) {

            params.append(
                "search",
                search
            );

        }


        if (
            category &&
            category !== "all"
        ) {

            params.append(
                "category",
                category
            );

        }


        if (sort) {

            params.append(
                "sort",
                sort
            );

        }


        const response =
            await fetch(
                `${API_URL}?${params.toString()}`,
                {
                    headers:
                        authHeaders()
                }
            );


        if (response.status === 401) {

            logout();

            return;

        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load products."
            );

        }


        products =
            result.data || [];


        renderProducts(
            products
        );


        renderPagination(
            result.pagination
        );


        const total =
            result.pagination
                ? result.pagination.total
                : products.length;


        updateElement(
            "productCountLabel",
            `${total} product${total === 1 ? "" : "s"}`
        );


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );


        if (productsTableBody) {

            productsTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center py-5"
                    >

                        <strong class="text-danger">
                            Unable to load products
                        </strong>

                        <p>
                            ${escapeHtml(
                                error.message
                            )}
                        </p>

                    </td>

                </tr>

            `;

        }

    }

}


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts(productList) {

    if (!productsTableBody) {
        return;
    }


    if (
        !productList ||
        productList.length === 0
    ) {

        productsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center py-5"
                >

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            📦
                        </div>

                        <h5>
                            No products found
                        </h5>

                        <p class="text-muted">
                            Try changing your search or filters.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    productsTableBody.innerHTML =
        productList.map(
            product => {

                const status =
                    getStockStatus(
                        product.stock_quantity
                    );


                const statusClass =
                    getStatusClass(
                        status
                    );


                return `

                    <tr>

                        <td>

                            <div class="product-name-cell">

                                <div class="product-avatar">
                                    ${getProductInitial(
                                        product.name
                                    )}
                                </div>

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            product.name
                                        )}
                                    </strong>

                                    <small class="text-muted d-block">
                                        #${product.id}
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>

                            <span class="category-badge">
                                ${escapeHtml(
                                    product.category
                                )}
                            </span>

                        </td>


                        <td>
                            ₹${Number(
                                product.price
                            ).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </td>


                        <td>
                            <strong>
                                ${product.stock_quantity}
                            </strong>
                        </td>


                        <td>

                            <span
                                class="stock-badge ${statusClass}"
                            >
                                ${status}
                            </span>

                        </td>


                        <td>
                            ${formatDate(
                                product.updated_at ||
                                product.created_at
                            )}
                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                    class="btn btn-sm btn-outline-primary"
                                    onclick="viewProduct(${product.id})"
                                >
                                    View
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    onclick="editProduct(${product.id})"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="deleteProduct(${product.id})"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ============================================================
// PAGINATION
// ============================================================

function renderPagination(data) {

    if (!pagination || !data) {
        return;
    }


    if (data.pages <= 1) {

        pagination.innerHTML = "";

        return;

    }


    let html = "";


    html += `

        <button
            class="page-btn"
            ${data.has_previous ? "" : "disabled"}
            onclick="goToPage(${data.page - 1})"
        >
            ‹
        </button>

    `;


    for (
        let page = 1;
        page <= data.pages;
        page++
    ) {

        html += `

            <button
                class="page-btn ${
                    page === data.page
                        ? "active"
                        : ""
                }"
                onclick="goToPage(${page})"
            >
                ${page}
            </button>

        `;

    }


    html += `

        <button
            class="page-btn"
            ${data.has_next ? "" : "disabled"}
            onclick="goToPage(${data.page + 1})"
        >
            ›
        </button>

    `;


    pagination.innerHTML =
        html;

}


function goToPage(page) {

    if (page < 1) {
        return;
    }


    currentPage = page;

    loadProducts();

}


// ============================================================
// STATISTICS
// ============================================================

async function loadStatistics() {

    try {

        const response =
            await fetch(
                `${API_URL}/stats/summary`,
                {
                    headers:
                        authHeaders()
                }
            );


        if (response.status === 401) {

            logout();

            return;

        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        const stats =
            result.data;


        updateElement(
            "totalProducts",
            stats.total_products ?? 0
        );


        updateElement(
            "inStock",
            stats.in_stock ?? 0
        );


        updateElement(
            "lowStock",
            stats.low_stock ?? 0
        );


        updateElement(
            "outOfStock",
            stats.out_of_stock ?? 0
        );


        updateElement(
            "totalStockUnits",
            stats.total_stock_units ?? 0
        );


        const health =
            Number(
                stats.inventory_health ?? 0
            );


        updateElement(
            "healthScore",
            `${health}%`
        );


        const progress =
            document.getElementById(
                "healthProgress"
            );


        if (progress) {

            progress.style.width =
                `${health}%`;

        }


        renderInventoryChart(
            stats
        );


        await loadAttentionProducts();


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}


// ============================================================
// CHART
// ============================================================

function renderInventoryChart(stats) {

    const canvas =
        document.getElementById(
            "inventoryChart"
        );


    if (!canvas) {
        return;
    }


    if (inventoryChart) {

        inventoryChart.destroy();

    }


    inventoryChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "In Stock",
                        "Low Stock",
                        "Out of Stock"
                    ],

                    datasets: [
                        {
                            data: [
                                stats.in_stock,
                                stats.low_stock,
                                stats.out_of_stock
                            ]
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ============================================================
// ATTENTION
// ============================================================

async function loadAttentionProducts() {

    try {

        const response =
            await fetch(
                `${API_URL}/attention`,
                {
                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        renderAttentionProducts(
            result.data
        );


    } catch (error) {

        console.error(
            "Attention error:",
            error
        );

    }

}


function renderAttentionProducts(
    list
) {

    if (!attentionGrid) {
        return;
    }


    if (
        !list ||
        list.length === 0
    ) {

        attentionGrid.innerHTML = `

            <div class="attention-empty">

                <div class="attention-empty-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        Everything looks good!
                    </strong>

                    <p class="text-muted mb-0">
                        No products need attention.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    attentionGrid.innerHTML =
        list.map(
            product => {

                const status =
                    getStockStatus(
                        product.stock_quantity
                    );


                return `

                    <div class="attention-card">

                        <div class="attention-card-header">

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        product.name
                                    )}
                                </strong>

                                <small class="text-muted d-block">
                                    ${escapeHtml(
                                        product.category
                                    )}
                                </small>

                            </div>

                            <span
                                class="stock-badge ${
                                    getStatusClass(
                                        status
                                    )
                                }"
                            >
                                ${status}
                            </span>

                        </div>


                        <div class="attention-card-body">

                            <span>
                                Stock
                            </span>

                            <strong>
                                ${product.stock_quantity}
                            </strong>

                        </div>


                        <button
                            class="btn btn-sm btn-outline-primary"
                            onclick="viewProduct(${product.id})"
                        >
                            View Product
                        </button>

                    </div>

                `;

            }
        ).join("");

}


// ============================================================
// CATEGORIES
// ============================================================

async function loadCategories() {

    try {

        const response =
            await fetch(
                `${API_URL}?page=1&per_page=50`,
                {
                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {
            return;
        }


        const categories = [
            ...new Set(
                result.data
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ].sort();


        const current =
            categoryFilter.value;


        categoryFilter.innerHTML = `

            <option value="all">
                All Categories
            </option>

            ${categories.map(
                category => `

                    <option
                        value="${escapeHtml(
                            category
                        )}"
                    >
                        ${escapeHtml(
                            category
                        )}
                    </option>

                `
            ).join("")}

        `;


        if (
            categories.includes(
                current
            )
        ) {

            categoryFilter.value =
                current;

        }

    } catch (error) {

        console.error(
            "Category error:",
            error
        );

    }

}


// ============================================================
// ADD PRODUCT
// ============================================================

function openAddProductModal() {

    currentProductId = null;

    productModalTitle.textContent =
        "Add New Product";

    clearProductForm();

    clearFormError();

    showModal(
        productModal
    );

}


// ============================================================
// EDIT PRODUCT
// ============================================================

async function editProduct(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        const product =
            result.data;


        currentProductId =
            product.id;


        productModalTitle.textContent =
            "Edit Product";


        productId.value =
            product.id;


        productName.value =
            product.name;


        productCategory.value =
            product.category;


        productPrice.value =
            product.price;


        productStock.value =
            product.stock_quantity;


        productDescription.value =
            product.description || "";


        clearFormError();

        showModal(
            productModal
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// ============================================================
// SAVE PRODUCT
// ============================================================

async function saveProduct(
    event
) {

    event.preventDefault();


    const data = {

        name:
            productName.value.trim(),

        category:
            productCategory.value.trim(),

        price:
            productPrice.value,

        stock_quantity:
            productStock.value,

        description:
            productDescription.value.trim()

    };


    const error =
        validateProduct(
            data
        );


    if (error) {

        showFormError(
            error
        );

        return;

    }


    const editing =
        currentProductId !== null;


    const url =
        editing
            ? `${API_URL}/${currentProductId}`
            : API_URL;


    const method =
        editing
            ? "PUT"
            : "POST";


    try {

        const response =
            await fetch(
                url,
                {
                    method,

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        hideModal(
            productModal
        );


        clearProductForm();


        currentProductId =
            null;


        await loadProducts();

        await loadStatistics();

        await loadCategories();


        showToast(
            editing
                ? "Product updated successfully."
                : "Product created successfully.",
            "success"
        );

    } catch (error) {

        showFormError(
            error.message
        );

    }

}


// ============================================================
// DELETE
// ============================================================

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    const name =
        product
            ? product.name
            : "this product";


    if (
        !confirm(
            `Delete "${name}"?`
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method:
                        "DELETE",

                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        await loadProducts();

        await loadStatistics();

        await loadCategories();


        showToast(
            "Product deleted successfully.",
            "success"
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// ============================================================
// VIEW PRODUCT
// ============================================================

async function viewProduct(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        const product =
            result.data;


        const status =
            getStockStatus(
                product.stock_quantity
            );


        productDetails.innerHTML = `

            <div class="product-details-container">

                <div class="product-details-header">

                    <div class="product-avatar large">
                        ${getProductInitial(
                            product.name
                        )}
                    </div>

                    <div>

                        <h4>
                            ${escapeHtml(
                                product.name
                            )}
                        </h4>

                        <span class="category-badge">
                            ${escapeHtml(
                                product.category
                            )}
                        </span>

                    </div>

                </div>


                <div class="product-details-grid">

                    <div class="detail-item">

                        <span class="detail-label">
                            Product ID
                        </span>

                        <strong>
                            #${product.id}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Price
                        </span>

                        <strong>
                            ₹${Number(
                                product.price
                            ).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Stock
                        </span>

                        <strong>
                            ${product.stock_quantity}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Status
                        </span>

                        <span
                            class="stock-badge ${
                                getStatusClass(
                                    status
                                )
                            }"
                        >
                            ${status}
                        </span>

                    </div>

                </div>


                <div class="product-description">

                    <span class="detail-label">
                        Description
                    </span>

                    <p>
                        ${
                            product.description
                                ? escapeHtml(
                                    product.description
                                )
                                : "No description provided."
                        }
                    </p>

                </div>


                <div class="product-dates">

                    <small>
                        Created:
                        ${formatDate(
                            product.created_at
                        )}
                    </small>

                    <small>
                        Updated:
                        ${formatDate(
                            product.updated_at
                        )}
                    </small>

                </div>

            </div>

        `;


        showModal(
            detailsModal
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// ============================================================
// VALIDATION
// ============================================================

function validateProduct(data) {

    if (!data.name) {

        return "Product name is required.";

    }


    if (data.name.length < 2) {

        return (
            "Product name must contain at least 2 characters."
        );

    }


    if (!data.category) {

        return "Category is required.";

    }


    const price =
        Number(data.price);


    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        return "Enter a valid price.";

    }


    const stock =
        Number(
            data.stock_quantity
        );


    if (
        !Number.isInteger(stock) ||
        stock < 0
    ) {

        return (
            "Stock must be a whole number of 0 or more."
        );

    }


    if (
        data.description.length > 1000
    ) {

        return (
            "Description cannot exceed 1000 characters."
        );

    }


    return null;

}


// ============================================================
// STOCK STATUS
// ============================================================

function getStockStatus(
    stock
) {

    const quantity =
        Number(stock);


    if (quantity === 0) {

        return "Out of Stock";

    }


    if (quantity <= 10) {

        return "Low Stock";

    }


    return "In Stock";

}


function getStatusClass(
    status
) {

    if (
        status === "In Stock"
    ) {

        return "status-in-stock";

    }


    if (
        status === "Low Stock"
    ) {

        return "status-low-stock";

    }


    return "status-out-of-stock";

}


// ============================================================
// CSV EXPORT
// ============================================================

async function exportCSV() {

    try {

        const response =
            await fetch(
                `${API_URL}/export/csv`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${localStorage.getItem(
                                "stockpilot_token"
                            )}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to export products."
            );

        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            "stockpilot_products.csv";


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();


        window.URL.revokeObjectURL(
            url
        );


        showToast(
            "CSV exported successfully.",
            "success"
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    localStorage.removeItem(
        "stockpilot_token"
    );

    localStorage.removeItem(
        "stockpilot_user"
    );


    window.location.href =
        "/";

}


// ============================================================
// USER
// ============================================================

function loadUser() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem(
                    "stockpilot_user"
                )
            );


        if (!user) {
            return;
        }


        const username =
            document.getElementById(
                "sidebarUsername"
            );


        if (username) {

            username.textContent =
                user.username;

        }

    } catch (error) {

        console.error(
            error
        );

    }

}


// ============================================================
// FORM
// ============================================================

function clearProductForm() {

    productId.value = "";

    productName.value = "";

    productCategory.value = "";

    productPrice.value = "";

    productStock.value = "";

    productDescription.value = "";

}


function showFormError(
    message
) {

    formError.textContent =
        message;

    formError.classList.remove(
        "d-none"
    );

}


function clearFormError() {

    formError.textContent = "";

    formError.classList.add(
        "d-none"
    );

}


// ============================================================
// MODALS
// ============================================================

function showModal(
    modal
) {

    if (!modal) {
        return;
    }


    bootstrap.Modal
        .getOrCreateInstance(
            modal
        )
        .show();

}


function hideModal(
    modal
) {

    if (!modal) {
        return;
    }


    bootstrap.Modal
        .getInstance(
            modal
        )
        ?.hide();

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    let container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "toastContainer";

        container.className =
            "toast-container-custom";

        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `stockpilot-toast ${
            type === "error"
                ? "toast-error"
                : "toast-success"
        }`;


    toast.innerHTML = `

        <span>
            ${
                type === "error"
                    ? "⚠️"
                    : "✓"
            }
        </span>

        <span>
            ${escapeHtml(
                message
            )}
        </span>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.remove();

        },
        3500
    );

}


// ============================================================
// REFRESH
// ============================================================

async function refreshDashboard() {

    await loadProducts();

    await loadStatistics();

    await loadCategories();

    showToast(
        "Dashboard refreshed.",
        "success"
    );

}


// ============================================================
// HELPERS
// ============================================================

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function getProductInitial(
    name
) {

    if (!name) {
        return "P";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function debounce(
    callback,
    delay
) {

    let timer;

    return function (...args) {

        clearTimeout(
            timer
        );

        timer =
            setTimeout(
                () => callback(
                    ...args
                ),
                delay
            );

    };

}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.openAddProductModal =
    openAddProductModal;

window.saveProduct =
    saveProduct;

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.viewProduct =
    viewProduct;

window.goToPage =
    goToPage;

window.refreshDashboard =
    refreshDashboard;

window.exportCSV =
    exportCSV;

window.logout =
    logout;