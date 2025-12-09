package io.temporal.demos.worker_versioning.model;

import lombok.Data;

@Data
public class MarketingCampaign {
    String campaignName;
    String campaignMetadata; // Contains details that are to be sent out.  (Needs formatting for target channel)
    CampaignTarget target;
}
