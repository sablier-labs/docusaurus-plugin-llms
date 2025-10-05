/**
 * Tests for filename generation functionality
 *
 * Run with: bun test-filenames.js
 */

const fs = require("node:fs");
const path = require("node:path");
const { generateIndividualMarkdownFiles } = require("../lib/generator");

// Helper to create a test document
function createTestDoc(filename, frontMatter = {}) {
  const baseName = path.basename(filename, ".md");
  const _dir = path.dirname(filename) === "." ? "" : path.dirname(filename);

  return {
    content: `This is ${baseName} content.`,
    description: `${baseName} documentation`,
    frontMatter,
    path: `docs/${filename}`,
    title: `${baseName} Title`,
    url: `https://example.com/docs/${filename}`,
  };
}

// Helper to clean up test directory
function cleanupTestDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// Helper to check if expected file exists and fallback doesn't
function validateFilePaths(testDir, expectedPath, fallbackPath) {
  const expectedFullPath = path.join(testDir, expectedPath);
  const fallbackFullPath = path.join(testDir, fallbackPath);

  if (!fs.existsSync(expectedFullPath)) {
    throw new Error(`Expected file at path "${expectedPath}" not found`);
  }

  if (expectedPath !== fallbackPath && fs.existsSync(fallbackFullPath)) {
    throw new Error(`Fallback file at path "${fallbackPath}" should not exist when frontmatter is used`);
  }
}

// Simplified test cases
const testCases = [
  {
    doc: createTestDoc("guides/config.md", { slug: "custom-config-slug" }),
    expectedPath: "guides/custom-config-slug.md",
    fallbackPath: "guides/config.md",
    name: "Uses slug for filename when slug present",
  },
  {
    doc: createTestDoc("api/reference.md", { id: "api-id", slug: "api-slug" }),
    expectedPath: "api/api-slug.md",
    fallbackPath: "api/reference.md",
    name: "Prioritizes slug over id when both present",
  },
  {
    doc: createTestDoc("tutorials/basic.md", { id: "tutorial-basic-id" }),
    expectedPath: "tutorials/tutorial-basic-id.md",
    fallbackPath: "tutorials/basic.md",
    name: "Uses id for filename when only id present",
  },
  {
    doc: createTestDoc("getting-started.md", { sidebar_position: 1, tags: ["guide"] }),
    expectedPath: "getting-started.md",
    fallbackPath: "getting-started.md",
    name: "Uses original filename when no slug or id",
  },
];

async function runFilenameTests() {
  console.log("Running filename tests...\n");

  const testDir = path.join(__dirname, "test-filenames");
  const siteUrl = "https://example.com";
  let passed = 0;
  let failed = 0;

  try {
    for (const testCase of testCases) {
      console.log(`Test: ${testCase.name}`);

      try {
        cleanupTestDirectory(testDir);

        const result = await generateIndividualMarkdownFiles([testCase.doc], testDir, siteUrl, "docs", []);

        // Validate file paths
        validateFilePaths(testDir, testCase.expectedPath, testCase.fallbackPath);

        // Validate URL
        const expectedUrl = `${siteUrl}/${testCase.expectedPath}`;
        if (result[0].url !== expectedUrl) {
          throw new Error(`Expected URL "${expectedUrl}", got "${result[0].url}"`);
        }

        console.log(`✅ PASS`);
        passed++;
      } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        failed++;
      }
    }
  } finally {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  }

  console.log(`\n========================================`);
  console.log(`Filename Tests Summary:`);
  console.log(`Passed: ${passed}, Failed: ${failed}, Total: ${passed + failed}`);
  console.log(`========================================\n`);

  return failed === 0;
}

// Run the tests
runFilenameTests()
  .then((success) => {
    console.log(success ? "🎉 All filename tests passed!" : "❌ Some filename tests failed.");
    if (!success) process.exit(1);
  })
  .catch((error) => {
    console.error("Test runner error:", error);
    process.exit(1);
  });
