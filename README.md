*This project has been created as part of the 42 curriculum by gigardin, asanni, madias-m, lsampiet, fleite-j.*

# ft_bridge mentorias

A real-time mentorship platform where mentors and mentees connect, schedule sessions with Google Meet integration, chat in real-time, and track progress through gamification — built as a microservice architecture with full observability.

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Individual Contributions](#individual-contributions)
- [Instructions](#instructions)
- [Resources](#resources)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Description

**RSAA** is a collaborative mentorship platform built for the 42 school community. It enables mentors and mentees to:

- **Connect** — Request and manage mentor-mentee relationships with approval workflows
- **Schedule** — Book mentoring sessions with automatic Google Meet link generation and Google Calendar integration
- **Chat** — Communicate in real-time through WebSocket-based messaging
- **Track Progress** — Earn XP, unlock achievements, maintain streaks, and level up through a gamification system
- **Monitor** — Full infrastructure observability with Prometheus metrics and Grafana dashboards

### Key Features

- Real-time chat (WebSocket/STOMP over SockJS)
- Mentor availability management with day/time slot configuration
- Automated Google Meet + Calendar event creation for scheduled sessions
- Recurring session support
- Mentor rating system
- Achievement and XP/level progression system
- Profile image upload via dedicated Python microservice
- Google OAuth 2.0 authentication
- Password recovery via email
- Privacy Policy and Terms of Service pages
- Full HTTPS with self-signed certificates via Nginx reverse proxy
- Infrastructure monitoring with 18 alerting rules across 5 groups

---

## Team Information

| Member | 42 Login | Role(s) | Responsibilities |
|--------|----------|---------|-----------------|
| **Giovanna** | `gigardin` | Product Owner / UX Designer / Backend Developer | UX/UI design, feature prioritization, wireframes, user flows, project coordination, documentation |
| **Adedayo** | `asanni` | Frontend Developer | React components, pages, frontend services, UI implementation, chat interface |
| **Letícia** | `lsampiet` | Frontend Developer | React components, design system, responsive layouts, gamification UI, accessibility |
| **Marcelo** | `madias-m` | Backend Developer | Spring Boot API, JPA entities, business logic, WebSocket chat, Google Calendar/Meet integration |
| **Fábio** | `fleite-j` | Backend Developer / DevOps | Python microservice, MongoDB integration, Prometheus/Grafana monitoring, Docker infrastructure |

---

## Project Management

### Work Organization

- **Sprint-based approach**: Work was divided into 2-week sprints with clear deliverables.
- **Task distribution**: Features were assigned based on roles (frontend vs. backend), with cross-functional collaboration for integration points (e.g., chat, scheduling).
- **Code reviews**: Pull requests reviewed by at least one other team member before merging.

### Tools

- **Version Control**: Git / GitHub — branches per feature, meaningful commit messages
- **Task Tracking**: GitHub Issues and project board for backlog and sprint management
- **Communication**: Discord for daily async communication and weekly sync meetings

---

## Technical Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework (SPA) |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 7.2.4 | Build tool and dev server |
| **React Router** | 7.13.0 | Client-side routing |
| **Radix UI** | Various | Accessible UI primitives (Dialog, Toast, Select, Switch, Label) |
| **Lucide React** | 0.577.0 | Icon library |
| **STOMP.js + SockJS** | 7.0.0 / 1.6.1 | Real-time WebSocket chat |
| **React Day Picker** | 9.14.0 | Calendar component |
| **date-fns** | 4.1.0 | Date formatting and manipulation |
| **@react-oauth/google** | 0.12.1 | Google OAuth 2.0 login |
| **@fontsource/inter** | 5.2.8 | Typography (Inter font) |

**Justification**: React was chosen for its mature ecosystem, component-based architecture, and team familiarity. Radix UI provides accessible, unstyled primitives that allowed us to build a custom design system. Vite was chosen for its fast build times with SWC.

### Backend (Java)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Spring Boot** | 4.0.1 | Application framework |
| **Java** | 21 | Runtime |
| **Spring Data JPA / Hibernate** | (via Spring Boot) | ORM for PostgreSQL |
| **Spring WebSocket (STOMP)** | (via Spring Boot) | Real-time chat |
| **Spring Actuator + Micrometer** | (via Spring Boot) | Metrics export to Prometheus |
| **JJWT** | 0.12.5 | JWT token generation and validation |
| **Spring Security Crypto** | 6.2.0 | BCrypt password hashing |
| **Passay** | 1.6.4 | Password policy validation |
| **Google Calendar API** | v3-rev20260225 | Google Meet link + Calendar event creation |
| **Google Auth** | 1.23.0 | OAuth2 credential management |
| **Spring Boot Mail** | 3.5.3 | Email sending (password recovery) |

**Justification**: Spring Boot was chosen for its enterprise-grade features, built-in security, JPA/Hibernate ORM, WebSocket support, and seamless Actuator integration for monitoring. Java 21 provides modern language features and long-term support.

### Backend (Python)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.115.0 | Lightweight async API framework |
| **Uvicorn** | 0.32.0 | ASGI server |
| **Motor** | 3.6.0 | Async MongoDB driver |
| **Prometheus FastAPI Instrumentator** | 7.0.0 | Metrics export |

**Justification**: FastAPI was chosen for the profile/image microservice due to its async I/O capabilities, ideal for handling binary image data with MongoDB. Separating this into its own service follows the microservice architecture pattern.

### Databases

| Database | Version | Purpose |
|----------|---------|---------|
| **PostgreSQL** | 16 | Primary relational database (15 tables) — users, profiles, mentorship connections, sessions, chat messages, achievements, XP |
| **MongoDB** | 7 | Document store for profile images (base64) and skill stacks |

**Justification**: PostgreSQL was chosen for its robustness with relational data, JPA/Hibernate support, and ACID compliance for transactional operations like mentorship management. MongoDB was chosen for profile images and flexible schema data (skill stacks) where a document-oriented approach is more natural.

### Infrastructure

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker / Docker Compose** | Latest | Containerization and orchestration |
| **Nginx** | stable-alpine | HTTPS reverse proxy, static file serving, WebSocket proxy |
| **Prometheus** | 2.52.0 | Metrics collection (7 scrape targets) |
| **Grafana** | 11.1.0 | Dashboards and visualization (3 pre-built dashboards) |
| **Node Exporter** | 1.8.1 | Host-level metrics |
| **cAdvisor** | 0.49.1 | Container-level metrics |
| **Postgres Exporter** | 0.15.0 | PostgreSQL metrics |
| **MongoDB Exporter** | 0.40 | MongoDB metrics |

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │              Client (Browser)               │
                        │         React 19 SPA + WebSocket            │
                        └──────────────────┬──────────────────────────┘
                                           │ HTTPS (443)
                                           ▼
                        ┌─────────────────────────────────────────────┐
                        │            Nginx Reverse Proxy              │
                        │     SSL/TLS · Static Frontend Serving       │
                        │  ft-trans.42.fr / localhost                  │
                        └───┬──────────────┬──────────────────────────┘
                            │              │
               /api/java/* │              │ /api/python/*
                            ▼              ▼
              ┌──────────────────┐  ┌──────────────────┐
              │  Spring Boot API │  │  FastAPI Service  │
              │   (Port 8080)    │  │   (Port 8000)     │
              │                  │  │                   │
              │ • REST endpoints │  │ • Profile images  │
              │ • WebSocket/STOMP│  │ • Skill stacks    │
              │ • JWT auth       │  │ • Prometheus      │
              │ • Google API     │  │   metrics         │
              │ • Business logic │  │                   │
              └────────┬─────────┘  └────────┬──────────┘
                       │                     │
                       ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐
              │   PostgreSQL 16  │  │    MongoDB 7      │
              │   (Port 5432)    │  │   (Port 27017)    │
              │   15 tables      │  │   2 collections   │
              └──────────────────┘  └──────────────────┘

              ┌──────────────────────────────────────────┐
              │         Monitoring Stack                  │
              │                                          │
              │  Prometheus (9090) ◄── 7 scrape targets  │
              │       │                                  │
              │       ▼                                  │
              │  Grafana (3000) — 3 dashboards           │
              │                                          │
              │  Exporters:                              │
              │    • Node Exporter (9100)                 │
              │    • cAdvisor (8081)                      │
              │    • Postgres Exporter (9187)             │
              │    • MongoDB Exporter (9216)              │
              └──────────────────────────────────────────┘
```

---

## Database Schema

### PostgreSQL (15 Tables)

#### Users & Authentication

| Table | Key Columns | Description |
|-------|------------|-------------|
| `users` | `id` (PK), `email` (unique), `name`, `phoneNumber` (unique), `password`, `status`, `createdAt` | Core user accounts |
| `password_recovery_token` | `id` (PK), `token` (UUID), `user_id` (FK→users), `expiryDate` (+1h) | Password reset tokens |

#### Profiles

| Table | Key Columns | Description |
|-------|------------|-------------|
| `profiles` | `id` (PK), `user_id` (FK→users), `role` (MENTOR / MENTORADO), `position`, `bio`, `xp`, `level`, `anosExperiencia`, `linkedin`, `github`, `instagram` | User profiles with role-based differentiation |
| `limit_mentee` | `id` (PK), `mentor_id` (FK→profiles, unique), `limitOfMentee` (1-50, default 10) | Max mentees per mentor |

#### Mentorship System

| Table | Key Columns | Description |
|-------|------------|-------------|
| `mentorship_connection` | `id` (PK), `mentor_id` (FK→profiles), `mentee_id` (FK→profiles), `status` (PENDING / APPROVED / REJECTED / CANCELLED / ENDED), `acceptedAt` | Mentor-mentee relationship requests and approvals |
| `mentorship_count` | `id` (PK), `mentorship_connection_id` (FK, unique), `mentor_id`, `status`, `limitOfMentee` | Tracks active mentee counts per mentor |
| `mentorships` | `id` (PK), `mentor_id` (FK), `mentee_id` (FK), `topic`, `notes`, `status` (REQUESTED / ACCEPTED / REJECTED / CANCELLED / COMPLETED / NO_SHOW) | Individual mentorship records |
| `mentorship_session` | `id` (PK), `connection_id`, `scheduledDate`, `durationMinutes` (60-240), `meetUrl`, `status` (SCHEDULED / COMPLETED / NO_SHOW / CANCELLED), `isRecurrent`, `recurrenceGroupId`, `mentorNotes` | Scheduled sessions with Google Meet URLs |
| `mentor_availability` | `id` (PK), `mentor_id` (FK), `dayOfWeek` (enum), `startTime`, `endTime`, `slotDuration` | Mentor weekly availability slots |
| `mentor_ratings` | `id` (PK), `mentor_id` (FK), `mentee_id` (FK), `ratingValue`, unique(mentor+mentee) | 1-to-1 mentor ratings |

#### Chat

| Table | Key Columns | Description |
|-------|------------|-------------|
| `messages` | `id` (PK), `sender_id` (FK→users), `receiver_id` (FK→users), `content` (TEXT), `isRead` | Chat message history |

#### Gamification

| Table | Key Columns | Description |
|-------|------------|-------------|
| `achievements` | `id` (PK), `name` (unique), `description`, `type`, `target`, `xp_reward`, `iconUrl` | Achievement definitions |
| `user_achievements` | `id` (PK), `user_id`, `achievement_id`, unique(user+achievement), `unlockedAt` | Unlocked achievements per user |
| `levels` | `id` (PK), `level` (unique), `xpRequired`, `iconUrl` | Level progression thresholds |
| `user_streak` | `id` (PK), `user_id` (unique), `currentStreak`, `bestStreak`, `lastCheckinDate` | Daily login streaks |
| `xp_history` | `id` (PK), `user_id`, `xp`, `reason` | XP transaction log |

### MongoDB (2 Collections)

| Collection | Fields | Description |
|-----------|--------|-------------|
| `profiles` | `profile_id`, `stacks` (array) | Extended profile data — skill stacks |
| `profile_images` | `profile_id`, `image_base64`, `image_file_name` | Profile avatar images stored as base64 |

### Relationships Diagram

```
users (1) ──────── (N) profiles
  │                    │
  │                    ├── (N) mentorship_connection ──► mentorship_count
  │                    ├── (N) mentor_availability
  │                    ├── (N) mentor_ratings
  │                    ├── (N) mentorships
  │                    └── (1) limit_mentee
  │
  ├── (N) messages (sender + receiver)
  ├── (N) user_achievements ──► achievements
  ├── (1) user_streak
  ├── (N) xp_history
  └── (N) password_recovery_token

mentorship_connection (1) ──── (N) mentorship_session
```

---

## Features List

| # | Feature | Description | Team Member(s) |
|---|---------|-------------|----------------|
| 1 | **User Registration & Login** | Email/password auth with BCrypt hashing, input validation (Passay), JWT tokens | Marcelo, Fábio |
| 2 | **Google OAuth 2.0** | Sign in with Google account, token validation | Marcelo |
| 3 | **Password Recovery** | "Forgot password" flow with email token (Mailtrap SMTP) | Marcelo |
| 4 | **User Profile Management** | Edit name, bio, position, social links (LinkedIn, GitHub, Instagram) | Adedayo, Letícia, Marcelo |
| 5 | **Profile Avatar Upload** | Image upload and retrieval via Python microservice + MongoDB | Marcelo, Fábio, Adedayo |
| 6 | **Mentor/Mentee Role System** | Users create profiles as MENTOR or MENTORADO with role-specific views | Marcelo, Giovanna |
| 7 | **Mentorship Connection Flow** | Request → Approve/Reject → End connection lifecycle with status tracking (PENDING, APPROVED, CANCELLED, ENDED) | Giovanna, Letícia |
| 8 | **Mentor Availability Management** | Configure weekly availability slots (day, start/end time, duration) | Fábio, Letícia |
| 9 | **Session Scheduling** | Book mentoring sessions from available slots with date/time selection | Giovanna, Letícia |
| 10 | **Google Meet Integration** | Automatic Google Meet link generation when scheduling sessions via Google Calendar API | Giovanna |
| 11 | **Recurring Sessions** | Support for recurrent mentoring sessions with group tracking | Giovanna, Letícia |
| 12 | **Mentor Rating System** | Mentees can rate their mentors (one rating per pair) | Fábio, Letícia |
| 13 | **Mentor Dashboard** | Dashboard for mentors to manage their mentees, sessions and availability | Letícia, Giovanna |
| 14 | **Real-time Chat** | WebSocket/STOMP-based messaging between users with read status and history persistence | Giovanna, Adedayo |
| 15 | **Online User Status** | Real-time tracking of online/offline users via WebSocket connection | Giovanna, Adedayo |
| 16 | **Gamification — XP & Levels** | Earn XP for actions (sessions, logins, connections); level up with progression | Fábio, Letícia |
| 17 | **Gamification — Achievements** | Unlock achievements for milestones; persistent tracking with visual feedback | Fábio, Letícia |
| 18 | **Gamification — Streaks** | Daily login streak tracking with best streak record | Fábio |
| 19 | **Custom Design System** | 27+ reusable components: Button, IconButton, Badge, Avatar, Dialog, Toast, Select, Switch, ProgressBar, Rating, InputGroup, Label, MentorCard, MenteeInfo, CalendarCard, TimeSlot, etc. | Letícia, Adedayo, Giovanna |
| 20 | **Responsive Layout** | Sidebar navigation, header, footer — responsive across devices | Letícia, Adedayo |
| 21 | **Privacy Policy & Terms of Service** | Legal pages with relevant content accessible from footer links | Giovanna |
| 22 | **Prometheus Monitoring** | 7 scrape targets collecting metrics from all services and infrastructure | Giovanna |
| 23 | **Grafana Dashboards** | 3 pre-built dashboards: Application Overview, Infrastructure, JVM Metrics | Giovanna |
| 24 | **Alerting Rules** | 18 alerts across 5 groups (services, Spring Boot, PostgreSQL, MongoDB, infrastructure) | Giovanna |
| 25 | **Notification System** | Toast notifications for connection requests, session bookings, achievements, and CRUD operations | Letícia, Adedayo |

---

## Modules

### Major Modules (2 points each)

| # | Module | Points | Description | Implementation | Team Member(s) |
|---|--------|--------|-------------|---------------|----------------|
| 1 | **User Interaction** | 2 | Basic chat, profile system, friends (connection) system | Real-time chat via WebSocket/STOMP with SockJS, message history persistence in PostgreSQL, read receipts, online status tracking; profile viewing; mentor-mentee connection system with request/approve/reject/end lifecycle | Giovanna, Adedayo, Letícia |
| 2 | **Standard User Management & Authentication** | 2 | Profile updates, avatar upload, friends/online status, profile page | Email/password auth with BCrypt + Passay validation, JWT tokens, profile CRUD, avatar upload via Python microservice to MongoDB, online status via WebSocket registry | Marcelo, Fábio, Adedayo, Letícia |
| 3 | **Monitoring with Prometheus & Grafana** | 2 | Prometheus metrics, exporters, Grafana dashboards, alerting rules, secure access | Prometheus scrapes 7 targets (Spring Boot Actuator, FastAPI, PostgreSQL, MongoDB, Node, cAdvisor, self); 3 Grafana dashboards provisioned automatically; 18 alerting rules across 5 groups; Grafana secured with admin credentials from `.env` | Giovanna |
| 4 | **Backend as Microservices** | 2 | Loosely-coupled services with clear interfaces, REST APIs, single responsibility | Spring Boot API (core business logic, auth, chat, scheduling) + FastAPI Python service (profile images, skill stacks) + Nginx reverse proxy routing; each service has its own database (PostgreSQL / MongoDB); inter-service communication via REST through Nginx | Marcelo, Fábio |
| 5 | **Mentorship Session Scheduling System** *(Module of Choice)* | 2 | Automated scheduling with Google Meet integration, calendar sync, recurring sessions | Mentor availability slot configuration (day/time/duration); session booking with conflict detection; automatic Google Meet link generation via Google Calendar API; recurring session support with group tracking; session status management (SCHEDULED → COMPLETED / NO_SHOW / CANCELLED); email notifications. This module demonstrates significant technical complexity through external API integration (Google Calendar + Meet), recurrence logic, and real-time availability management. | Giovanna, Fábio, Letícia |

**Major Total: 5 × 2 = 10 points**

### Minor Modules (1 point each)

| # | Module | Points | Description | Implementation | Team Member(s) |
|---|--------|--------|-------------|---------------|----------------|
| 1 | **Frontend Framework** | 1 | Use React | React 19.2.0 with TypeScript 5.9.3, Vite 7.2.4, React Router 7.13.0 | Adedayo, Letícia |
| 2 | **Backend Framework** | 1 | Use Spring Boot | Spring Boot 4.0.1 (Java 21) + FastAPI 0.115.0 (Python) | Marcelo, Fábio |
| 3 | **ORM for Database** | 1 | Use JPA/Hibernate | Spring Data JPA with Hibernate, 15 JPA entities mapped to PostgreSQL tables with relationships, lazy/eager loading, cascade operations | Marcelo |
| 4 | **Notification System** | 1 | Toast notifications for CRUD operations | Radix UI Toast system for real-time user feedback on all create, update, delete actions across the application (connections, sessions, profile updates, achievements) | Adedayo, Letícia |
| 5 | **Custom Design System** | 1 | 10+ reusable components with consistent design | 27+ reusable components built with Radix UI primitives, Inter font, Lucide icons, consistent color palette and typography across the application | Letícia, Adedayo, Giovanna |
| 6 | **Additional Browser Support** | 1 | Compatibility with Firefox, Safari, Edge | Tested and verified across Google Chrome (primary), Firefox, Safari, and Microsoft Edge. Responsive CSS, standard APIs, and cross-browser compatible libraries used throughout | Letícia, Adedayo |
| 7 | **OAuth 2.0 Authentication** | 1 | Google OAuth login | Google OAuth 2.0 via `@react-oauth/google` on frontend + `google-auth-library` on backend for token validation; seamless sign-in flow | Marcelo |
| 8 | **Gamification System** | 1 | XP/levels, achievements, streaks | XP earned for actions (sessions, connections, logins); 5+ achievements with unlock tracking; daily login streaks (current + best); level progression with XP thresholds; visual feedback via progress bars, badges, and toast notifications; all data persisted in PostgreSQL (5 gamification tables) | Fábio, Letícia |

**Minor Total: 8 × 1 = 8 points**

### Points Summary

| Type | Count | Points Each | Total |
|------|-------|-------------|-------|
| Major Modules | 5 | 2 | 10 |
| Minor Modules | 8 | 1 | 8 |
| **Grand Total** | | | **18** |

> Required: 14 points. Our project achieves **18 points**, providing a comfortable margin.

---

## Individual Contributions

### Giovanna (`gigardin`) — Product Owner / UX Designer / Backend Developer

### Adedayo (`asanni`) — Frontend Developer

### Letícia (`lsampiet`) — Frontend Developer

### Marcelo (`madias-m`) — Backend Developer

### Fábio (`fleite-j`) — Backend Developer / DevOps

---

## Instructions

### Prerequisites

- **Docker** and **Docker Compose** (v2) installed
- **Make** (GNU Make)
- **Git**
- A modern browser (Chrome, Firefox, Safari, or Edge)

### Environment Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Transcendence
   ```

2. **Create the `.env` file** from the example:

   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your values:

   ```env
   # Database
   POSTGRES_USER=appuser
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=appdb

   # Docker Compose
   COMPOSE_PROJECT_NAME=rsaa

   # Google OAuth (required for Google login and Meet integration)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token

   # Grafana
   GRAFANA_ADMIN_USER=admin
   GRAFANA_ADMIN_PASSWORD=your_grafana_password
   ```

   > **Note**: Google OAuth credentials are required for Google login and Google Meet session scheduling. Obtain them from the [Google Cloud Console](https://console.cloud.google.com/) with Calendar API enabled.

### Running the Project

4. **Build and start all services** (single command):

   ```bash
   make
   ```

   This will:
   - Create necessary data directories
   - Add `ft-trans.42.fr` to `/etc/hosts` (requires sudo)
   - Build and start all 12 Docker containers

5. **Access the application:**

   | Service | URL |
   |---------|-----|
   | Application | `https://ft-trans.42.fr` or `https://localhost` |
   | Grafana | `http://localhost:3000` |
   | Prometheus | `http://localhost:9090` |

   > Accept the self-signed SSL certificate warning in your browser.

### Other Commands

```bash
make stop          # Stop all services
make start         # Start stopped services
make restart       # Restart all services
make down          # Stop and remove containers
make logs          # Follow logs from all services
make build         # Rebuild all images (no cache)
make ps            # Show container status
make shell-<name>  # Shell into a container (e.g., make shell-springboot-api)
make clean         # Remove containers and local images
make fclean        # Full clean (containers, volumes, images)
make re            # Full clean + rebuild
```

### Windows (WSL2) Notes

If running on Windows via WSL2:
- Add `127.0.0.1 ft-trans.42.fr` to `C:\Windows\System32\drivers\etc\hosts` manually
- Run `make` from within the WSL2 terminal

---

## Resources

### Documentation & References

- [Spring Boot 4.0 Documentation](https://spring.io/projects/spring-boot)
- [React 19 Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Google Calendar API](https://developers.google.com/calendar)
- [STOMP over WebSocket](https://stomp-js.github.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

### AI Usage Disclosure

AI tools (GitHub Copilot, ChatGPT) were used during development for the following tasks:

- **Code assistance**: Debugging complex integration issues (WebSocket configuration, Google Calendar API authentication, Docker networking, Hibernate lazy loading)
- **Configuration**: Prometheus alerting rules syntax, Grafana dashboard JSON structure, Nginx proxy configuration for WebSocket support
- **Documentation**: Structuring this README and ensuring all required sections were covered
- **Troubleshooting**: Resolving CORS issues between microservices, JWT filter configuration for actuator endpoints, cross-browser CSS compatibility

All AI-generated code was reviewed, tested, and understood by the team before integration.

---

## Known Limitations

- **Self-signed SSL certificates**: Browsers will show a security warning. In production, proper certificates (e.g., Let's Encrypt) should be used.
- **Google Meet integration**: Requires valid Google Cloud credentials with Calendar API enabled. Without these, sessions can still be scheduled but without automatic Meet links.
- **Email notifications**: Currently configured with Mailtrap sandbox for development. In production, a proper SMTP provider should be configured.
- **Profile images**: Stored as base64 in MongoDB. For large-scale deployment, an object storage solution (S3, MinIO) would be more appropriate.
- **No mobile-native app**: The application is a responsive web app, not a native mobile application.

---

## License

This project was developed as part of the 42 school curriculum. See [LICENSE](LICENSE) for details.
