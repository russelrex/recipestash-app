# Backend: Align Recipe Steps with Frontend (Create/Update Recipe)

## Problem

Create/update recipe requests return **400 Bad Request** with validation errors like:

```json
{
  "message": [
    "steps.0.property description should not exist",
    "steps.0.instruction should not be empty",
    "steps.0.instruction must be a string",
    "steps.1.property description should not exist",
    ...
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Cause:** The backend DTO validates `steps[].instruction` and disallows `description`, while the frontend sends `steps[].description` (and `stepNumber`, `imageUrl`). The field names are mismatched.

---

## Frontend Contract (What the app sends)

The React Native app sends the following when **creating** or **updating** a recipe.

### Request body (relevant parts)

```json
{
  "title": "Chocolate Cake",
  "description": "A rich chocolate cake.",
  "ingredients": ["flour", "sugar", ...],
  "instructions": ["Step 1 text", "Step 2 text"],
  "steps": [
    {
      "stepNumber": 1,
      "description": "Preheat oven to 350°F and grease the pan.",
      "imageUrl": "https://..."
    },
    {
      "stepNumber": 2,
      "description": "Mix dry ingredients in a bowl."
    }
  ],
  "category": "dessert",
  "prepTime": 15,
  "cookTime": 45,
  "servings": 4,
  "difficulty": "medium",
  "ownerId": "...",
  "ownerName": "...",
  "featuredImage": "https://...",
  "images": [],
  "featured": false
}
```

### Steps array shape (frontend)

| Field       | Type    | Required | Description                          |
|------------|---------|----------|--------------------------------------|
| `stepNumber` | number  | Yes      | 1-based order (1, 2, 3, …)          |
| `description` | string  | Yes      | Step text (instruction content)     |
| `imageUrl`   | string  | No       | Optional image URL for this step    |

The frontend does **not** send `instruction`; it sends `description` for the step text.

---

## What the backend should do

### Option A (recommended): Accept the frontend's field names

Update the backend so that:

1. **Recipe step DTO** (create/update) accepts:
   - `stepNumber: number`
   - `description: string` (the step text)
   - `imageUrl?: string` (optional)

2. **Validation**:
   - Require `description` (non-empty string).
   - Do **not** require or validate `instruction`.
   - Allow `imageUrl` to be optional string.

3. **Storage**:
   - Persist the step text in whatever field you use in the DB (e.g. `instruction` or `description`). If your schema uses `instruction`, map `description` → `instruction` when saving and `instruction` → `description` when returning JSON so the frontend keeps working.

**Example (NestJS class-validator DTO):**

```typescript
// create-recipe-step.dto.ts or update-recipe-step.dto.ts
export class RecipeStepDto {
  @IsNumber()
  stepNumber: number;

  @IsString()
  @IsNotEmpty({ message: 'Step description is required' })
  description: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
```

**Example (if DB still uses `instruction`):**

```typescript
// In your service or entity, when saving:
const stepToSave = {
  stepNumber: step.stepNumber,
  instruction: step.description,  // map description -> instruction for DB
  imageUrl: step.imageUrl,
};
```

When returning recipes to the client, map `instruction` → `description` in the response so the frontend always sees `description`.

---

### Option B: Keep backend as-is and change the frontend

If the backend must keep using `instruction` and must **not** accept `description`:

- The frontend would need to send `instruction` instead of `description` for each step.
- Then the backend would not need to change; only the React Native app would be updated to send `steps[].instruction` and stop sending `steps[].description`.

Use this option only if the backend API is fixed and cannot be changed.

---

## Checklist for backend (Option A)

- [ ] Update recipe step DTO(s) used in create/update recipe to use `description` (required string) and `stepNumber`, `imageUrl` (optional).
- [ ] Remove validation that requires `instruction` or forbids `description`.
- [ ] In the service layer, map incoming `description` to your DB field (e.g. `instruction`) when saving.
- [ ] In API responses, map DB field back to `description` so the frontend receives the same shape.
- [ ] Ensure `steps` array is optional on create/update if you still support legacy `instructions`-only payloads.
- [ ] Re-test create and update recipe with a `steps` array containing `stepNumber`, `description`, and optional `imageUrl`.

---

## Summary

| Current backend expects | Frontend sends | Action |
|-------------------------|----------------|--------|
| `steps[].instruction`   | `steps[].description` | Prefer: backend accepts `description` and maps to/from `instruction` internally. |
| (may disallow `description`) | `steps[].description` | Remove validation that forbids `description`. |
| -                      | `steps[].stepNumber`   | Backend should accept and store. |
| -                      | `steps[].imageUrl`     | Backend should accept as optional. |

After the backend accepts `stepNumber`, `description`, and optional `imageUrl` (and no longer requires or exclusively validates `instruction`), create/update recipe from the app should succeed without 400 validation errors.
