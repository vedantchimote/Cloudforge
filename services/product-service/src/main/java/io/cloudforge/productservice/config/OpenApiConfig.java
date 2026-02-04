package io.cloudforge.productservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "CloudForge Product Service API", version = "1.0.0", description = "Product catalog service for CloudForge e-commerce platform", contact = @Contact(name = "CloudForge Team", email = "team@cloudforge.io")), servers = {
        @Server(url = "http://localhost:8082", description = "Local Development Server")
})
public class OpenApiConfig {
}
