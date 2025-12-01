package io.temporal.demos.worker_versioning.model;

import lombok.Data;

@Data
public class CreditLimit {
    String userID;
    String applicationName;
    long creditLimit;
}

