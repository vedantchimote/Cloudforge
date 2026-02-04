package io.cloudforge.orderservice.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String sku;
    private List<String> images;
    private List<String> tags;
    private boolean active;
}
