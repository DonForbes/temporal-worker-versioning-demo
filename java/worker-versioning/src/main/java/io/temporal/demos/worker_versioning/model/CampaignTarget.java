package io.temporal.demos.worker_versioning.model;

import lombok.Data;

@Data
public class CampaignTarget {
    List <String> targetUsers;
    List <String> targetUserGroups;

}
