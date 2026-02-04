---
title: "Product Service"
description: "Product Catalog and Inventory Service"
---

# Product Service

The Product Service manages the e-commerce catalog with MongoDB for flexible product data and Redis for high-performance caching.

## Architecture

```mermaid
graph TD
    A[ProductController] --> B[ProductService]
    B --> C[ProductRepository]
    B --> D[(Redis Cache)]
    C --> E[(MongoDB)]
```

## Configuration

Key settings in `application.yml`:

```yaml
server:
  port: 8082

spring:
  data:
    mongodb:
      uri: mongodb://root:mongo123@localhost:27017/products?authSource=admin
      database: products
    redis:
      host: localhost
      port: 6379
      password: redis123
  cache:
    type: redis
    redis:
      time-to-live: 600000  # 10 minutes
```

## Configuration Classes

| Class | Purpose |
| :--- | :--- |
| `MongoConfig` | Enables MongoDB auditing for `@CreatedDate` and `@LastModifiedDate` |
| `RedisConfig` | Configures RedisCacheManager with JSON serialization |
| `CorsConfig` | Allows cross-origin requests from frontend (ports 5173, 3000) |
| `OpenApiConfig` | Swagger/OpenAPI documentation metadata |

## API Endpoints

### List Products
`GET /api/products`

Returns a paginated list of active products.

**Query Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | int | 0 | Page number (0-indexed) |
| `size` | int | 20 | Items per page |

### Get Product by ID
`GET /api/products/{id}`

Returns a single product. Cached in Redis.

### Get Products by Category
`GET /api/products/category/{category}`

Filter products by category name with pagination.

### Search Products
`GET /api/products/search?q={query}`

Full-text search using MongoDB text indexes on `name` and `description`.

### Get Latest Products
`GET /api/products/latest`

Returns the 10 most recently added active products. Cached.

### Create Product
`POST /api/products`

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "category": "Electronics",
  "price": 299.99,
  "stock": 50,
  "sku": "WH-1000",
  "images": ["url1", "url2"],
  "tags": ["featured", "new"]
}
```

### Update Product
`PUT /api/products/{id}`

Updates all fields of an existing product.

### Delete Product
`DELETE /api/products/{id}`

Removes a product from the catalog.

### Update Stock
`PATCH /api/products/{id}/stock?quantity={qty}`

Adjusts inventory. Use negative values to decrease stock.

## Product Model

The `Product` document in MongoDB:

```mermaid
erDiagram
    PRODUCT {
        string id PK
        string name
        string description
        string category
        decimal price
        int stock
        string sku
        string[] images
        string[] tags
        boolean active
        timestamp createdAt
        timestamp updatedAt
    }
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | MongoDB ObjectId |
| `name` | String | Product name (text indexed, weight: 3) |
| `description` | String | Product description (text indexed) |
| `category` | String | Category name (indexed) |
| `price` | BigDecimal | Product price |
| `stock` | Integer | Available inventory |
| `sku` | String | Stock Keeping Unit |
| `images` | List\<String\> | Image URLs |
| `tags` | List\<String\> | Product tags |
| `active` | boolean | Visibility flag (default: true) |
| `createdAt` | LocalDateTime | Auto-set on creation |
| `updatedAt` | LocalDateTime | Auto-set on update |

## Caching Strategy

Redis caching is implemented at the service layer:

```java
@Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
public Page<ProductDTO> getAllProducts(Pageable pageable)

@Cacheable(value = "product", key = "#id")
public ProductDTO getProductById(String id)

@CacheEvict(value = {"products", "product", "latestProducts"}, allEntries = true)
public ProductDTO createProduct(ProductDTO productDTO)
```

All write operations (`create`, `update`, `delete`, `updateStock`) evict relevant caches to maintain consistency.
