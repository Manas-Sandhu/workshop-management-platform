# WORKSHOP — Database Design

The PostgreSQL database is managed via Prisma (`server/prisma/schema.prisma`) and consists of **4 models** and **2 enums**.

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Workshop : "creates (createdById)"
    User ||--o{ Registration : "books (userId)"
    User ||--o{ RefreshToken : "owns (userId)"
    Workshop ||--o{ Registration : "has (workshopId)"

    User {
        String id PK "UUID v4 (@default(uuid()))"
        String name "2-100 chars"
        String email UK "@unique, lowercase"
        String passwordHash "bcrypt (12 rounds)"
        Role role "ADMIN | USER (@default(USER))"
        DateTime createdAt "@default(now())"
    }

    Workshop {
        String id PK "UUID v4 (@default(uuid()))"
        String createdById FK "References User.id (ON DELETE RESTRICT)"
        String title "3-150 chars"
        String description "Nullable, up to 2000 chars"
        DateTime dateTime "Scheduled session timestamp"
        Int capacity "Positive integer (> 0)"
        String whatsappLink "Valid URL to WhatsApp group"
        WorkshopStatus status "PUBLISHED | CANCELLED (@default(PUBLISHED))"
        DateTime createdAt "@default(now())"
        DateTime updatedAt "@updatedAt"
    }

    Registration {
        String id PK "UUID v4 (@default(uuid()))"
        String userId FK "References User.id (ON DELETE RESTRICT)"
        String workshopId FK "References Workshop.id (ON DELETE RESTRICT)"
        String fullName "Attendee submitted name"
        String email "Attendee submitted email"
        String mobileNumber "10-15 digits (+optional)"
        DateTime registeredAt "@default(now())"
    }

    RefreshToken {
        String id PK "UUID v4 (@default(uuid()))"
        String userId FK "References User.id (ON DELETE CASCADE)"
        String tokenHash UK "@unique, SHA-256 hex digest"
        DateTime expiresAt "7 days from login"
        DateTime createdAt "@default(now())"
    }
```

---

## Database Constraints & Business Rules

1. **Unique Email Constraint (`User_email_key`)**: Enforces one account per normalized (trimmed, lowercase) email address.
2. **Composite Unique Registration Constraint (`@@unique([userId, workshopId])`)**: Guarantees at the database level that a user can never book the same workshop twice, acting as a hard safety net behind the application-level check.
3. **Referential Integrity (`ON DELETE RESTRICT` vs `ON DELETE CASCADE`)**:
   - `Workshop.createdById`, `Registration.userId`, and `Registration.workshopId` use `ON DELETE RESTRICT` to prevent accidental deletion of users or workshops that have historical registration records.
   - `RefreshToken.userId` uses `ON DELETE CASCADE` so deleting a user automatically purges all of their active sessions.
4. **Pessimistic Concurrency Control**: Capacity-sensitive mutations (`registerForWorkshop`, `updateWorkshop`, `cancelWorkshop`, `publishWorkshop`) acquire a PostgreSQL row lock (`SELECT "id" FROM "Workshop" WHERE "id" = $1 FOR UPDATE`) before reading registration counts or mutating status.
