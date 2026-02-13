package io.cloudforge.productservice.service;

import io.cloudforge.productservice.dto.ProductDTO;
import io.cloudforge.productservice.model.Product;
import io.cloudforge.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    // Note: Page objects cannot be cached in Redis due to serialization issues
    // Caching disabled for paginated results to avoid ClassCastException
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(ProductDTO::fromEntity);
    }

    @Cacheable(value = "product", key = "#id")
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return ProductDTO.fromEntity(product);
    }

    // Note: Page objects cannot be cached in Redis due to serialization issues
    public Page<ProductDTO> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable)
                .map(ProductDTO::fromEntity);
    }

    // Note: Page objects cannot be cached in Redis due to serialization issues
    public Page<ProductDTO> searchProducts(String query, Pageable pageable) {
        return productRepository.searchByText(query, pageable)
                .map(ProductDTO::fromEntity);
    }

    @Cacheable(value = "latestProducts")
    public List<ProductDTO> getLatestProducts() {
        return productRepository.findTop10ByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = { "products", "product", "latestProducts" }, allEntries = true)
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = productDTO.toEntity();
        Product savedProduct = productRepository.save(product);
        log.info("Created product: {}", savedProduct.getId());
        return ProductDTO.fromEntity(savedProduct);
    }

    @CacheEvict(value = { "products", "product", "latestProducts" }, allEntries = true)
    public ProductDTO updateProduct(String id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setStock(productDTO.getStock());
        existingProduct.setSku(productDTO.getSku());
        existingProduct.setImages(productDTO.getImages());
        existingProduct.setTags(productDTO.getTags());
        existingProduct.setActive(productDTO.isActive());

        Product savedProduct = productRepository.save(existingProduct);
        log.info("Updated product: {}", savedProduct.getId());
        return ProductDTO.fromEntity(savedProduct);
    }

    @CacheEvict(value = { "products", "product", "latestProducts" }, allEntries = true)
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product: {}", id);
    }

    @CacheEvict(value = { "products", "product", "latestProducts" }, allEntries = true)
    public ProductDTO updateStock(String id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        int newStock = product.getStock() + quantity;
        if (newStock < 0) {
            throw new RuntimeException("Insufficient stock for product: " + id);
        }

        product.setStock(newStock);
        Product savedProduct = productRepository.save(product);
        log.info("Updated stock for product {}: {} -> {}", id, product.getStock() - quantity, newStock);

        return ProductDTO.fromEntity(savedProduct);
    }
}
