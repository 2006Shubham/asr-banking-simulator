package com.asr.asr_banking_simulator.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fd_interest")
public class FdInterest {

    @Id
    @Column(name = "interest_id", length = 20, nullable = false)
    private String interestId;

    @Column(name = "fd_id", length = 20, nullable = false)
    private String fdId;

    @Column(name = "interest_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal interestAmount;

    @Column(name = "calc_date", nullable = false)
    private LocalDate calcDate;

    @Column(name = "payout_date", nullable = false)
    private LocalDate payoutDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Pending";

    public FdInterest() {}

    public FdInterest(String interestId, String fdId, BigDecimal interestAmount, LocalDate calcDate, LocalDate payoutDate, String status) {
        this.interestId = interestId;
        this.fdId = fdId;
        this.interestAmount = interestAmount;
        this.calcDate = calcDate;
        this.payoutDate = payoutDate;
        this.status = status;
    }

    public String getInterestId() { return interestId; }
    public void setInterestId(String interestId) { this.interestId = interestId; }

    public String getFdId() { return fdId; }
    public void setFdId(String fdId) { this.fdId = fdId; }

    public BigDecimal getInterestAmount() { return interestAmount; }
    public void setInterestAmount(BigDecimal interestAmount) { this.interestAmount = interestAmount; }

    public LocalDate getCalcDate() { return calcDate; }
    public void setCalcDate(LocalDate calcDate) { this.calcDate = calcDate; }

    public LocalDate getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDate payoutDate) { this.payoutDate = payoutDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
