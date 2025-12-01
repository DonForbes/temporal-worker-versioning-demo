package io.temporal.demos.worker_versioning.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreditLimits {
    List<CreditLimit> creditLimits = new ArrayList<CreditLimit>();
}
