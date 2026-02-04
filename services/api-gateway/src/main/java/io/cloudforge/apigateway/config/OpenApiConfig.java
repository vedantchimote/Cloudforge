package io.cloudforge.apigateway.config;

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
                        .title("CloudForge API Gateway")
                        .version("1.0.0")
                        .description(
                                "API Gateway for CloudForge Microservices. Use the dropdown above to explore different services.")
                        .contact(new Contact()
                                .name("CloudForge Team")
                                .url("https://cloudforgetech.in"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
