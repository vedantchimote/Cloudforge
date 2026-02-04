package io.cloudforge.orderservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CloudForge Order Service API")
                        .description("Order and Cart Management Microservice for CloudForge E-Commerce Platform")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CloudForge Team")
                                .url("https://cloudforgetech.in")
                                .email("support@cloudforgetech.in"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8083").description("Development"),
                        new Server().url("https://api.cloudforgetech.in/orders").description("Production")));
    }
}
