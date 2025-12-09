package io.temporal.demos.worker_versioning.model;

import lombok.Data;

import java.util.List;
@Data
public class MarketingBundle {
    String bundleLocation;
    String bundleName;
    List<String> channels;

    List <String> impact;
}
