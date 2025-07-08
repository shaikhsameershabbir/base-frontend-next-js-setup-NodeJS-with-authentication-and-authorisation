# Project Information

## Overview
This project is developed using **Test-Driven Development (TDD)** methodology to ensure reliability, maintainability, and robust functionality. The backend is built with **Node.js, Express, and TypeScript**, following industry best practices.

## Development Approach
The project follows a strict **TDD workflow**, which consists of the following steps:
1. **Write Tests First** – Define test cases before writing any implementation code.
2. **Run Tests** – Ensure tests fail initially to confirm correctness.
3. **Write Minimal Code** – Implement the required functionality to pass the tests.
4. **Refactor** – Optimize the code while ensuring all tests continue to pass.
5. **Repeat** – Continue iterating to enhance the application.

## Technologies Used
- **Backend:** Node.js, Express
- **Language:** TypeScript
- **Database:** MongoDB / PostgreSQL
- **Testing Frameworks:** Jest, Supertest
- **Authentication:** JWT / OAuth
- **Linting & Formatting:** ESLint, Prettier
- **Logging:** Winston
- **Environment Management:** dotenv
- **Pre-commit Hooks & Git Standards:** Husky, Lint-Staged

## Project Structure
```
/project-root
│── src/
│   ├── config/
│   │   ├── index.ts
│   │   ├── logger.ts
│   ├── middlewares/
│   ├── globalErrorHandler.ts
│   ├── app.ts
│   ├── server.ts
│   ├── utils.ts
│   ├── tests/
│── config/
│── docs/
│── .husky/
│── .env
│── .env.example
│── jest.config.js
│── tsconfig.json
│── package.json
│── package-lock.json
│── .gitignore
│── .dockerignore
│── nodemon.json
```

## Running the Project
### Installation
```bash
npm install
```
### Running Tests
```bash
npm test
```
### Starting the Server
```bash
npm run dev
```
### run project in docker 
```bash
   docker build -t auth-service:dev -f docker/dev/DocketFile .
```
### check docker images 
```bash
   docker image ls
```
### Run express in docket image with port binding and sourcecode sync 
```bash
  docker run --rm -it -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules --env-file ${PWD}/.env -p 5555:5555 -e NODE_ENV=development auth-service:dev
```
### list the running containers 
```bash
   docker ps command  
```
### then choose docker container which you are willing to stop and then run 
```bash
   docker stop <container id>
```

## Development Standards
### Husky
Husky is used to enforce Git hooks, ensuring that developers follow best practices before committing code. This project includes:
- **Pre-commit hooks:** Run ESLint and TypeScript checks.
- **Post-install hooks:** Ensure Husky is set up automatically.
- **Lint-Staged:** Ensures only staged files are linted to optimize performance.

### ESLint & TypeScript-ESLint
- Ensures code quality and enforces consistent style.
- Runs before every commit via Husky.
- Uses TypeScript-specific linting rules for enhanced type safety.

### Prettier
- Ensures consistent code formatting.
- Works alongside ESLint for style enforcement.

## Contributing
- Follow the **TDD workflow** for any new feature implementation.
- Write **unit and integration tests** for every module.
- Ensure all tests pass before submitting pull requests.
- Maintain code quality using linting tools.

## License
This project is licensed under the **ISC License**.

