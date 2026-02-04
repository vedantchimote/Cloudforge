package io.cloudforge.swaggeraggregator.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CloudForge API Documentation")
                        .version("1.0.0")
                        .description("Unified API documentation for all CloudForge microservices. " +
                                "Use the dropdown above to switch between different services.")
                        .contact(new Contact()
                                .name("CloudForge Team")
                                .url("https://cloudforgetech.in")
                                .email("support@cloudforgetech.in"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
