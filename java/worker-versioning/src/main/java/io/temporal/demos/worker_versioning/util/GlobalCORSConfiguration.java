package io.temporal.demos.worker_versioning.util;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class GlobalCORSConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow all paths
                .allowedOrigins("http://localhost:5080",
                                "http://localhost",
                                "http://ui.versioning.demo.com") // Whitelist these origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // The allowed HTTP methods
                .allowedHeaders("*")
                .allowCredentials(true) // Allow credentials
                .maxAge(3600); // Cache preflight response for 1 hour
    }
}

