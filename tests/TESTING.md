# Testing the docusaurus-plugin-llms

This document provides guidance on how to test the Docusaurus plugin, particularly the path transformation features.

## Unit Testing

We've provided two test scripts you can run to test the plugin functionality:

1. `tests/test-path-transforms.js` - Unit tests for the path transformation function
2. `tests/test-path-transformation.js` - Integration tests that simulate a Docusaurus build

### Running Unit Tests

To test just the path transformation logic:

```bash
bun tests/test-path-transforms.js
```

This will run a series of test cases against the path transformation function and verify the results.

### Running Integration Tests

To run the integration tests that simulate a Docusaurus build:

```bash
# Build the plugin first
just build

# Then run the tests
bun tests/test-path-transformation.js
```

This creates a test directory structure, runs the plugin with various configurations, and outputs the results for
verification.

## Testing in a Real Docusaurus Project

To test the plugin in a real Docusaurus project:

1. **Create a new Docusaurus site**:

   ```bash
   npx @docusaurus/init@latest init my-test-site classic
   cd my-test-site
   ```

2. **Link your plugin for local development**:

   From your plugin directory:

   ```bash
   npm link
   ```

   From your Docusaurus project:

   ```bash
   npm link docusaurus-plugin-llms
   ```

3. **Add the plugin to your docusaurus.config.js**:

   ```js
   module.exports = {
     // ... other config
     plugins: [
       [
         "docusaurus-plugin-llms",
         {
           // Test your path transformation options
           pathTransformation: {
             ignorePaths: ["api"],
             addPaths: ["reference"],
           },
         },
       ],
     ],
   };
   ```

4. **Build the Docusaurus site**:

   ```bash
   bun run build
   ```

5. **Check the output**:

   After building, check the `build` directory for the generated `llms.txt` and `llms-full.txt` files. Verify that the
   URLs are transformed according to your configuration.

## Verifying URL Transformations

When testing path transformations, verify that:

1. **ignorePaths**: Path segments specified are removed from the URLs
2. **addPaths**: Path segments are added to the URLs when they don't already exist
3. **Combined transformations**: Both operations work correctly together

Example paths to test:

- `docs/getting-started.md` → should become → `getting-started` (with ignorePaths: ['docs'])
- `docs/api/method.md` → should become → `reference/api/method` (with ignorePaths: ['docs'], addPaths: ['reference'])

## Troubleshooting

If you encounter issues with path transformations:

1. Check the regex in the `applyPathTransformations` function
2. Verify that the path segments are properly formatted (no leading/trailing slashes)
3. Run the unit tests to isolate potential issues
