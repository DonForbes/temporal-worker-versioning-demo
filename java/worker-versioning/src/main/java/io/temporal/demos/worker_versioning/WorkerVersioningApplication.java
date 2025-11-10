package io.temporal.demos.worker_versioning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class WorkerVersioningApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkerVersioningApplication.class, args);
	}

}
