package io.temporal.demos.worker_versioning.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Email {
    List<String> toEmailAddress = new ArrayList<String>();
    List<String> ccEmailAddress = new ArrayList<String>();
    String emailSubject;
    String emailBody;
}
