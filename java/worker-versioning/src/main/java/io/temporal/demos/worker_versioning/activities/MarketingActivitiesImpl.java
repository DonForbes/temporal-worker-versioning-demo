package io.temporal.demos.worker_versioning.activities;

import io.temporal.demos.worker_versioning.model.MarketingBundle;

public class MarketingActivitiesImpl implements MarketingActivities{

    @Override
    public MarketingBundle getMarketingBundle(String campaignName) {
        return null;
    }

    @Override
    public int sendMarketingBlast(MarketingBundle bundle) {
        return 0;
    }

    @Override
    public MarketingBundle getMarketingResults(MarketingBundle bundle) {
        return null;
    }
}
