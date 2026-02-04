package io.cloudforge.productservice.repository;

import io.cloudforge.productservice.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    Optional<Product> findBySku(String sku);

    @Query("{'$text': {'$search': ?0}}")
    Page<Product> searchByText(String searchText, Pageable pageable);

    List<Product> findByTagsContainingAndActiveTrue(String tag);

    List<Product> findTop10ByActiveTrueOrderByCreatedAtDesc();
}
