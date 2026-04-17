```markdown
# Gastro-smart Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the Gastro-smart JavaScript codebase. It covers file naming, import/export styles, commit message patterns, and testing approaches. While no frameworks are detected, the repository emphasizes clear structure and modularity, making it easy to maintain and extend.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names.
  - Example: `UserProfile.js`, `OrderHistory.js`

### Import Style
- **Relative imports** are used to include modules.
  - Example:
    ```javascript
    import { fetchData } from './ApiUtils';
    ```

### Export Style
- **Named exports** are preferred.
  - Example:
    ```javascript
    // In ApiUtils.js
    export function fetchData() { ... }
    export function postData() { ... }
    ```

### Commit Messages
- **Freeform** with no strict prefixes.
- Average commit message length: ~56 characters.
  - Example:  
    ```
    Add validation to user registration form
    ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or component  
**Command:** `/add-module`

1. Create a new file using PascalCase (e.g., `NewFeature.js`).
2. Use named exports for all functions or components.
3. Import dependencies using relative paths.
4. Write corresponding tests in a file named `NewFeature.test.js`.

### Refactoring Existing Code
**Trigger:** When improving or restructuring code  
**Command:** `/refactor`

1. Identify the module to refactor.
2. Ensure the file name follows PascalCase.
3. Update imports/exports to use relative paths and named exports.
4. Run all relevant tests to ensure nothing is broken.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create a test file named `ModuleName.test.js` in the same directory.
2. Write tests following the existing patterns (see Testing Patterns below).
3. Run tests to verify correctness.

## Testing Patterns

- **Test files** are named using the pattern `*.test.*` (e.g., `UserProfile.test.js`).
- The testing framework is **unknown**, but tests are colocated with modules.
- Example test file structure:
  ```javascript
  import { fetchData } from './ApiUtils';

  test('fetchData returns expected result', () => {
    // Test implementation here
  });
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-module    | Scaffold a new module/component              |
| /refactor      | Refactor an existing module or component     |
| /write-test    | Create or update a test file for a module    |
```
