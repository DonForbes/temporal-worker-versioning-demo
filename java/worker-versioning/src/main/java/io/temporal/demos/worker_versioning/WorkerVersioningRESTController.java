package io.temporal.demos.worker_versioning;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.temporal.client.WorkflowClient;


@RestController
@CrossOrigin()
public class WorkerVersioningRESTController {
    private static final Logger logger = LoggerFactory.getLogger(WorkerVersioningRESTController.class);

    @Autowired
    WorkflowClient client;

    @GetMapping("hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello World");
    }
}
