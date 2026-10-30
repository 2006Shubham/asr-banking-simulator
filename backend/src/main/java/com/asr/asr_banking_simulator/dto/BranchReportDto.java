package com.asr.asr_banking_simulator.dto;

import java.util.HashMap;
import java.util.Map;

public class BranchReportDto {
    private int totalInquiries;
    private int openInquiries;
    private int assignedInquiries;
    private int inProgressInquiries;
    private int escalatedInquiries;
    private int resolvedInquiries;
    private double avgResolutionHours;
    private Map<String, Integer> categoryBreakdown = new HashMap<>();
    private Map<String, Integer> statusBreakdown = new HashMap<>();
    private Map<String, Integer> priorityBreakdown = new HashMap<>();

    public BranchReportDto() {}

    public int getTotalInquiries() { return totalInquiries; }
    public void setTotalInquiries(int totalInquiries) { this.totalInquiries = totalInquiries; }

    public int getOpenInquiries() { return openInquiries; }
    public void setOpenInquiries(int openInquiries) { this.openInquiries = openInquiries; }

    public int getAssignedInquiries() { return assignedInquiries; }
    public void setAssignedInquiries(int assignedInquiries) { this.assignedInquiries = assignedInquiries; }

    public int getInProgressInquiries() { return inProgressInquiries; }
    public void setInProgressInquiries(int inProgressInquiries) { this.inProgressInquiries = inProgressInquiries; }

    public int getEscalatedInquiries() { return escalatedInquiries; }
    public void setEscalatedInquiries(int escalatedInquiries) { this.escalatedInquiries = escalatedInquiries; }

    public int getResolvedInquiries() { return resolvedInquiries; }
    public void setResolvedInquiries(int resolvedInquiries) { this.resolvedInquiries = resolvedInquiries; }

    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }

    public Map<String, Integer> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, Integer> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public Map<String, Integer> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Integer> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

    public Map<String, Integer> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Integer> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }
}

