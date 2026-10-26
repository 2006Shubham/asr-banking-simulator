package com.asr.asr_banking_simulator.dto;

/**
 * RolePrivilegeDto — Data Transfer Object for RBAC Catalog Queries
 * ============================================================================
 * Educational Purpose (DBMS Mini-Project — STAGE 13):
 * Captures role permissions defined in information_schema.TABLE_PRIVILEGES.
 * ============================================================================
 */
public class RolePrivilegeDto {

    private String grantee;
    private String tableSchema;
    private String tableName;
    private String privilegeType;

    public RolePrivilegeDto() {
    }

    public RolePrivilegeDto(String grantee, String tableSchema, String tableName, String privilegeType) {
        this.grantee = grantee;
        this.tableSchema = tableSchema;
        this.tableName = tableName;
        this.privilegeType = privilegeType;
    }

    public String getGrantee() {
        return grantee;
    }

    public void setGrantee(String grantee) {
        this.grantee = grantee;
    }

    public String getTableSchema() {
        return tableSchema;
    }

    public void setTableSchema(String tableSchema) {
        this.tableSchema = tableSchema;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getPrivilegeType() {
        return privilegeType;
    }

    public void setPrivilegeType(String privilegeType) {
        this.privilegeType = privilegeType;
    }
}
