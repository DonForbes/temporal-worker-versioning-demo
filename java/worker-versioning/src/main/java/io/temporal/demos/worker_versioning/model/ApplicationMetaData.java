package io.temporal.demos.worker_versioning.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ApplicationMetaData {
    String applicationName;
    String applicationURL;
    String userID; // User ID that is to be provisioned into app
    List<String> roles = new ArrayList<String>(); // Array of roles that will be granted to user
}
