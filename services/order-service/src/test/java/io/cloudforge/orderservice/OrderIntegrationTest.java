package io.cloudforge.orderservice;

import io.cloudforge.orderservice.client.ProductClient;
import io.cloudforge.orderservice.client.ProductResponse;
import io.cloudforge.orderservice.dto.OrderItemRequest;
import io.cloudforge.orderservice.dto.OrderRequest;
import io.cloudforge.orderservice.model.Order;
import io.cloudforge.orderservice.model.OrderStatus;
import io.cloudforge.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class OrderIntegrationTest {

        @Container
        static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

        @Container
        static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private ProductClient productClient;

        @DynamicPropertySource
        static void configureProperties(DynamicPropertyRegistry registry) {
                registry.add("spring.datasource.url", postgres::getJdbcUrl);
                registry.add("spring.datasource.username", postgres::getUsername);
                registry.add("spring.datasource.password", postgres::getPassword);
                registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        }

        @Test
        void shouldCreateOrderSuccessfully() throws Exception {
                UUID userId = UUID.randomUUID();
                String productId = "prod-123";

                OrderRequest orderRequest = OrderRequest.builder()
                                .shippingAddress("123 Test St")
                                .shippingCity("Test City")
                                .shippingCountry("Test Country")
                                .shippingState("TS")
                                .shippingZip("12345")
                                .notes("Test Order")
                                .items(List.of(OrderItemRequest.builder()
                                                .productId(productId)
                                                .quantity(2)
                                                .build()))
                                .build();

                ProductResponse productResponse = ProductResponse.builder()
                                .id(productId)
                                .name("Test Product")
                                .price(BigDecimal.valueOf(100.00))
                                .build();

                when(productClient.getProduct(productId)).thenReturn(productResponse);

                mockMvc.perform(post("/api/orders")
                                .header("X-User-Id", userId.toString())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(orderRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.status").value("PENDING"))
                                .andExpect(jsonPath("$.totalAmount").value(200.00));

                List<Order> orders = orderRepository.findAll();
                assertEquals(1, orders.size());
                assertEquals(OrderStatus.PENDING, orders.get(0).getStatus());
        }
}
