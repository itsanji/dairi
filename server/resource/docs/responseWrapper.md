# Response Wrapper Usage Examples

## Basic Usage

```typescript
import { successResponse, errorResponse } from '../utils/responseWrapper';

// Success response example
app.get('/users', async () => {
  const users = await db.getUsers();
  return successResponse(users);
});

// Error response example
app.post('/login', async ({ body }) => {
  const user = await db.findUser(body.username);
  
  if (!user) {
    return errorResponse('User not found');
  }
  
  return successResponse({ token: 'jwt-token-here' });
});
```

## Using the wrapResponse Function

```typescript
import { wrapResponse } from '../utils/responseWrapper';

app.get('/products', async () => {
  return wrapResponse(async () => {
    const products = await db.getProducts();
    return products;
  });
});
```

## Using with Elysia Controllers

```typescript
import Elysia from "elysia";
import { wrapResponse, successResponse } from "../utils/responseWrapper";

export const myController = new Elysia({
  name: "my-controller",
  prefix: "my-controller"
})
.get("/data", async () => {
  return wrapResponse(async () => {
    // Your logic here, anything thrown will be caught and formatted
    const data = await someAsyncOperation();
    return data;
  });
})
.post("/alternative", async ({ body }) => {
  try {
    // Alternative manual approach
    const result = await processData(body);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "System Error");
  }
});
```