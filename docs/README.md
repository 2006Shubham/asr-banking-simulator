# ASR Bank Simulator — Implementation Documentation

Welcome to the project implementation documentation for **ASR Bank Simulator** (DBMS Mini-Project & Full-Stack Banking Application).

This folder contains stage-by-stage documentation of all architectural decisions, database schemas, backend JPA models, and REST API controllers implemented so far.

---

## 📚 Implementation Stages Index

| Stage | Document | Scope & Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Stage 1** | [**Stage 1: Relational Database Schema**](./stage-1-database-schema.md) | MySQL schema (`Initialize.sql`), 14 relational tables, PK/FK constraints, deletion policies (`ON DELETE RESTRICT`), seed data with no redundant `cust_id` on loans. | ✅ Complete |
| **Stage 2** | [**Stage 2: Backend Entities & Repositories**](./stage-2-backend-entities-and-repositories.md) | Spring Data JPA models (`model/*.java`), composite key (`LoanBorrowerId`), 14 Repositories (`repository/*.java`), and CORS configuration (`CorsConfig.java`). | ✅ Complete |
| **Stage 3** | [**Stage 3: REST Controllers & CRUD APIs**](./stage-3-rest-controllers-and-crud-api.md) | 9 Spring Boot `@RestController` classes, request DTOs, atomic transfer transactions, card lock/unlock toggles, EMI payments. | ✅ Complete |
| **Stage 4** | [**Stage 4: End-to-End Live Integration**](./stage-4-live-integration-and-testing.md) | Connecting Vite frontend (`VITE_USE_MOCK=false`) to live Spring Boot APIs, launching services, and verifying CRUD operations. | ✅ Complete |

---

## 👥 Project Team
* **Rutuja**
* **Suraj**
* **Atharva**
* **Shubham**
