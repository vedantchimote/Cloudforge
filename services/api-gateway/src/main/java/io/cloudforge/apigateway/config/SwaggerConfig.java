package io.cloudforge.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.net.URI;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;

@Configuration
public class SwaggerConfig {

    @Bean
    public RouterFunction<ServerResponse> swaggerRouterFunction() {
        return RouterFunctions
                .route(GET("/swagger-ui.html"),
                        request -> ServerResponse.permanentRedirect(URI.create("/webjars/swagger-ui/index.html"))
                                .build())
                .andRoute(GET("/"),
                        request -> ServerResponse.permanentRedirect(URI.create("/webjars/swagger-ui/index.html"))
                                .build());
    }
}
