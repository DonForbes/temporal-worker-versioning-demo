package io.temporal.demos.worker_versioning.model;

import lombok.Data;

@Data
public class MarketingCampaign {
    String campaignName;
    CampaignTarget target;
}
