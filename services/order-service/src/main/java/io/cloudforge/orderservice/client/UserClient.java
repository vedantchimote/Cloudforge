package io.cloudforge.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", url = "${services.user-service-url}")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUser(@PathVariable("id") UUID id);

    @GetMapping("/api/users/email/{email}")
    UserResponse getUserByEmail(@PathVariable("email") String email);
}
