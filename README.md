# Cash flow project

---

## DB Diagram

https://dbdiagram.io/d/EdVisory-Test-677be96432a2da11cf1e3a6e

## Environment Variables

| Variable           | Description                           | Example     |
| ------------------ | ------------------------------------- | ----------- |
| `PORT`             | The port the server will run on       | `3000`      |
| `MONGODB_PORT`     | The port the mongo server will run on | `27017`     |
| `MONGODB_HOST`     | The host mongodb                      | `localhost` |
| `MONGODB_DATABASE` | The mongodb database name             | `cash-flow` |
| `SECRET_MESSAGE`   | The secret message for generate token | `haha`      |

---

### Defining Environment Variables

1. Create a `.env` file in the root directory of the project:

   ```bash
   touch .env
   ```

---

## Running the Project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run project :

   ```bash
   npm run dev
   ```
