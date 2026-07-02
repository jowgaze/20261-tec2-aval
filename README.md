# TEC2 Final Assessment - Travel Request Refactoring

This repository contains the final assessment project for the **Tópicos Especiais em Computação II** course at Universidade Estadual do Piauí (UESPI). 

The goal of this project was to analyze, test, and refactor a legacy travel request processing system, applying clean architecture principles, automated testing, and critical AI usage.

## Team Members
* **Jonatha Sousa Carvalho**
* **Biaggio Cardoso Soares de Oliveira**

## Technical Decisions & Architecture

The solution was refactored to enforce a strict separation of concerns, divided into three main layers:
* **Domain (`src/domain`):** Contains pure business rules, types, and validations. It has zero external dependencies.
* **Application (`src/application`):** Orchestrates the use cases. The `processTravelUseCase` evaluates the request via the domain and asynchronously delegates persistence to the infrastructure layer (fire-and-forget) to keep the public synchronous contract intact.
* **Infrastructure (`src/infra`):** Handles PostgreSQL database connections using the native `pg` driver to maintain simplicity without the overhead of an ORM.

## Setup
Clone the repository and install the dependencies:

```bash
npm install
```

## Checks

The project includes both legacy preservation tests and comprehensive unit tests for the newly implemented layers.

To verify type safety across the project without emitting compiled files:

```bash
npm run typecheck
```

To run the full suite of automated tests (including both the preservation tests and the team's unit tests):

```bash
npm test
```

To specifically run the legacy behavior tests against the public entry point (`src/main.ts`):

```bash
npm run test:original
```

## Database

*Note: You may copy `.env.example` to `.env` to keep the database URL in your local environment for manual script testing. However, the `.env` file must never be committed to version control.*

1. **Start the database container:**
```bash
npm run db:up
```

2. **Initialize the database tables:**
```bash
npm run db:init
```

3. **Stop the database container (when finished):**
```bash
npm run db:down
```

### Verifying Database Persistence

To manually verify that the application correctly connects and persists data to the PostgreSQL database running in Docker, we included an integration verification script (`src/run-travel.ts`).

After starting and initializing the database, you can execute this script using `tsx` to run the TypeScript file directly:

```bash
npx tsx src/run-travel.ts
```

*(Ensure that your `DATABASE_URL` environment variable is accessible, either exported in your terminal or via a `.env` file).*

**This script will:**

1. Generate a mock travel request and process it through the public `src/main.ts` entry point.
2. Wait briefly for the asynchronous (fire-and-forget) database insertion to complete.
3. Query the real PostgreSQL database to retrieve the newly inserted record.
4. Output a success message confirming that the persistence layer is fully operational and the data was saved.


## Critical Use of Artificial Intelligence

In compliance with the assignment requirements, Artificial Intelligence tools were utilized critically during the development of this project:

* **Tools Used:** GitHub Copilot and Google Gemini.
* **How it was used:** AI was used to generate boilerplate code for unit tests (Vitest), assist in translating legacy switch-case structures into lookup tables, and generate the PlantUML/Mermaid syntax for the dependency diagram.
* **Accepted Suggestions:** Suggestions regarding pure functions, early returns, and date manipulations (`Date.UTC`) in the domain layer were accepted as they improved readability and prevented timezone bugs.
* **Rejected/Modified Suggestions:** Copilot initially suggested implementing an ORM (Prisma) and using the `dotenv` package in the production code. These were actively rejected and modified to use the native `pg` driver and strict `process.env` injection to comply with the constraint of not adding undocumented external dependencies.
* **Validation:** All AI-generated code was strictly validated by running `npm run typecheck`, executing the Vitest test suites, and manually reviewing the code against the assignment's separation of concerns criteria.