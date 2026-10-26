package com.asr.asr_banking_simulator.dto;

/**
 * BufferPoolMetricsDto — InnoDB Memory Buffer Pool Health & Cache Hit Ratio
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 14):
 * Exposes live InnoDB storage engine buffer pool metrics, memory page counts,
 * and the calculated Cache Hit Ratio proving memory-versus-disk latency advantages.
 * ============================================================================
 */
public class BufferPoolMetricsDto {

    private long logicalReadRequests;
    private long physicalDiskReads;
    private double hitRatioPercent;
    private long totalPages;
    private long dataPages;
    private long freePages;
    private long dirtyPages;
    private long flushedPages;
    private double bufferPoolSizeMb;
    private String healthStatus;

    public BufferPoolMetricsDto() {
    }

    public BufferPoolMetricsDto(long logicalReadRequests, long physicalDiskReads, double hitRatioPercent,
                                long totalPages, long dataPages, long freePages, long dirtyPages,
                                long flushedPages, double bufferPoolSizeMb, String healthStatus) {
        this.logicalReadRequests = logicalReadRequests;
        this.physicalDiskReads = physicalDiskReads;
        this.hitRatioPercent = hitRatioPercent;
        this.totalPages = totalPages;
        this.dataPages = dataPages;
        this.freePages = freePages;
        this.dirtyPages = dirtyPages;
        this.flushedPages = flushedPages;
        this.bufferPoolSizeMb = bufferPoolSizeMb;
        this.healthStatus = healthStatus;
    }

    public long getLogicalReadRequests() {
        return logicalReadRequests;
    }

    public void setLogicalReadRequests(long logicalReadRequests) {
        this.logicalReadRequests = logicalReadRequests;
    }

    public long getPhysicalDiskReads() {
        return physicalDiskReads;
    }

    public void setPhysicalDiskReads(long physicalDiskReads) {
        this.physicalDiskReads = physicalDiskReads;
    }

    public double getHitRatioPercent() {
        return hitRatioPercent;
    }

    public void setHitRatioPercent(double hitRatioPercent) {
        this.hitRatioPercent = hitRatioPercent;
    }

    public long getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(long totalPages) {
        this.totalPages = totalPages;
    }

    public long getDataPages() {
        return dataPages;
    }

    public void setDataPages(long dataPages) {
        this.dataPages = dataPages;
    }

    public long getFreePages() {
        return freePages;
    }

    public void setFreePages(long freePages) {
        this.freePages = freePages;
    }

    public long getDirtyPages() {
        return dirtyPages;
    }

    public void setDirtyPages(long dirtyPages) {
        this.dirtyPages = dirtyPages;
    }

    public long getFlushedPages() {
        return flushedPages;
    }

    public void setFlushedPages(long flushedPages) {
        this.flushedPages = flushedPages;
    }

    public double getBufferPoolSizeMb() {
        return bufferPoolSizeMb;
    }

    public void setBufferPoolSizeMb(double bufferPoolSizeMb) {
        this.bufferPoolSizeMb = bufferPoolSizeMb;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }
}
