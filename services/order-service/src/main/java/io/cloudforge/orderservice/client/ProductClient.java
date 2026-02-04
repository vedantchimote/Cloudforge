package io.cloudforge.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "product-service", url = "${services.product-service-url}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getProduct(@PathVariable("id") String id);

    @PostMapping("/api/products/{id}/reserve")
    void reserveStock(@PathVariable("id") String id, @RequestBody StockRequest request);

    @PostMapping("/api/products/{id}/release")
    void releaseStock(@PathVariable("id") String id, @RequestBody StockRequest request);
}
