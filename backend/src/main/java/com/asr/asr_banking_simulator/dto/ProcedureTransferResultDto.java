package com.asr.asr_banking_simulator.dto;

/**
 * ProcedureTransferResultDto — Data Transfer Object for Stored Procedure Execution
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 10):
 * Captures the OUT parameters returned by the MySQL stored procedure
 * `sp_execute_interbank_transfer` via JDBC CallableStatement.
 * ============================================================================
 */
public class ProcedureTransferResultDto {

    private String statusCode;
    private String statusMessage;
    private String txnRef;

    public ProcedureTransferResultDto() {
    }

    public ProcedureTransferResultDto(String statusCode, String statusMessage, String txnRef) {
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.txnRef = txnRef;
    }

    public String getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(String statusCode) {
        this.statusCode = statusCode;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }
}
