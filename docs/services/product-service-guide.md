# Product Service Guide

Complete development guide for the Product microservice.

---

## 📋 Service Overview

| Property | Value |
|----------|-------|
| **Port** | 8082 |
| **Database** | MongoDB |
| **Cache** | Redis |
| **Messaging** | N/A |

### Responsibilities
- Product catalog management
- Category management
- Inventory tracking
- Product search and filtering
- Image management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Service                           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ProductController│ │CategoryController│ │SearchController│  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
│          │                  │                  │             │
│          ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Service Layer                       │        │
│  │ ProductService │ CategoryService │ SearchService │        │
│  └─────────────────────────────────────────────────┘        │
│          │                  │                                │
│          ▼                  ▼                                │
│  ┌───────────┐       ┌───────────┐                          │
│  │  MongoDB  │       │   Redis   │                          │
│  │ (Products)│       │  (Cache)  │                          │
│  └───────────┘       └───────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
services/product-service/
├── src/main/java/com/cloudforge/product/
│   ├── ProductServiceApplication.java
│   ├── controller/
│   │   ├── ProductController.java
│   │   ├── CategoryController.java
│   │   └── SearchController.java
│   ├── service/
│   │   ├── ProductService.java
│   │   ├── CategoryService.java
│   │   └── SearchService.java
│   ├── repository/
│   │   ├── ProductRepository.java
│   │   └── CategoryRepository.java
│   ├── model/
│   │   ├── Product.java
│   │   ├── Category.java
│   │   └── ProductAttribute.java
│   ├── dto/
│   │   ├── ProductRequest.java
│   │   ├── ProductResponse.java
│   │   └── SearchCriteria.java
│   └── config/
│       ├── MongoConfig.java
│       └── RedisConfig.java
└── src/main/resources/
    └── application.yml
```

---

## 🔧 Configuration

```yaml
# application.yml
spring:
  application:
    name: product-service

  data:
    mongodb:
      uri: mongodb://localhost:27017/cloudforge_products
      auto-index-creation: true

  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8082

cache:
  ttl:
    products: 300
    categories: 600
```

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products | ❌ |
| GET | `/api/products/{id}` | Get product | ❌ |
| POST | `/api/products` | Create product | ✅ ADMIN |
| PUT | `/api/products/{id}` | Update product | ✅ ADMIN |
| DELETE | `/api/products/{id}` | Delete product | ✅ ADMIN |
| GET | `/api/products/search` | Search products | ❌ |
| GET | `/api/categories` | List categories | ❌ |
| POST | `/api/categories` | Create category | ✅ ADMIN |

---

## 💻 Key Code

### Product Entity (MongoDB Document)
```java
@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    @Indexed
    private BigDecimal price;

    @Indexed
    private String categoryId;

    private Integer stock;

    private List<String> imageUrls;

    private Map<String, Object> attributes;

    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
```

### Product Repository
```java
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByCategoryId(String categoryId, Pageable pageable);

    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Page<Product> searchByName(String name, Pageable pageable);

    @Query("{ 'price': { $gte: ?0, $lte: ?1 } }")
    List<Product> findByPriceRange(BigDecimal min, BigDecimal max);

    @Aggregation(pipeline = {
        "{ $match: { categoryId: ?0 } }",
        "{ $group: { _id: null, avgPrice: { $avg: '$price' } } }"
    })
    AggregationResults<PriceStats> getAveragePriceByCategory(String categoryId);
}
```

### ProductService with Caching
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "products", key = "#id")
    public ProductResponse findById(String id) {
        log.info("Fetching product from MongoDB: {}", id);
        return productRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Cacheable(value = "products", key = "'category:' + #categoryId + ':page:' + #pageable.pageNumber")
    public Page<ProductResponse> findByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable)
            .map(this::toResponse);
    }

    @CachePut(value = "products", key = "#result.id")
    public ProductResponse create(ProductRequest request) {
        Product product = toEntity(request);
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(String id) {
        productRepository.deleteById(id);
    }

    public Page<ProductResponse> search(SearchCriteria criteria, Pageable pageable) {
        Query query = new Query().with(pageable);
        
        if (criteria.getName() != null) {
            query.addCriteria(Criteria.where("name")
                .regex(criteria.getName(), "i"));
        }
        if (criteria.getCategoryId() != null) {
            query.addCriteria(Criteria.where("categoryId")
                .is(criteria.getCategoryId()));
        }
        if (criteria.getMinPrice() != null) {
            query.addCriteria(Criteria.where("price")
                .gte(criteria.getMinPrice()));
        }
        if (criteria.getMaxPrice() != null) {
            query.addCriteria(Criteria.where("price")
                .lte(criteria.getMaxPrice()));
        }

        return productRepository.findAll(query, pageable).map(this::toResponse);
    }
}
```

### MongoDB Text Search
```java
// Enable text index
@Document(collection = "products")
@CompoundIndex(name = "text_idx", def = "{ 'name': 'text', 'description': 'text' }")
public class Product { ... }

// Search with text index
@Query("{ $text: { $search: ?0 } }")
Page<Product> fullTextSearch(String searchText, Pageable pageable);
```

---

## 🧪 Testing

```java
@DataMongoTest
@Testcontainers
class ProductRepositoryTest {

    @Container
    static MongoDBContainer mongo = new MongoDBContainer("mongo:6.0");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongo::getReplicaSetUrl);
    }

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldFindByCategory() {
        Product product = Product.builder()
            .name("Test Product")
            .categoryId("electronics")
            .price(new BigDecimal("99.99"))
            .build();
        productRepository.save(product);

        Page<Product> results = productRepository
            .findByCategoryId("electronics", Pageable.unpaged());

        assertThat(results.getContent()).hasSize(1);
    }
}
```

---

## 📚 Related Docs

- [Java Development Guide](java-development.md)
- [Database Schema](database-schema.md)
- [API Reference](api-reference.md)
