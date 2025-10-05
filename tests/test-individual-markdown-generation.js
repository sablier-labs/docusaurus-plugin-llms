/**
 * Tests for individual markdown file generation functionality
 *
 * Run with: bun test-individual-markdown-generation.js
 */

const fs = require("node:fs");
const path = require("node:path");
const { generateIndividualMarkdownFiles } = require("../lib/generator");

// Helper function to clean up test directory with nested structure
async function cleanupTestDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
  // Recreate empty directory for next test
  fs.mkdirSync(dir, { recursive: true });
}

// Test cases for individual markdown file generation
const testCases = [
  {
    docs: [
      {
        content: "This is the getting started guide.\n\nFollow these steps to begin.",
        description: "Introduction to the system",
        path: "docs/getting-started.md",
        title: "Getting Started",
        url: "https://example.com/docs/getting-started",
      },
    ],
    expectedPaths: ["getting-started.md"],
    name: "Basic markdown file generation with path preservation",
    siteUrl: "https://example.com",
  },
  {
    docs: [
      {
        content: "This is the API reference documentation.\n\nVersion 2.0 beta features.",
        description: "API reference documentation for version 2.0",
        path: "docs/api/reference.md",
        title: "API Reference: v2.0 (Beta)",
        url: "https://example.com/docs/api/reference",
      },
    ],
    expectedPaths: ["api/reference.md"],
    name: "Nested directory structure preservation",
    siteUrl: "https://example.com",
  },
  {
    docs: [
      {
        content: "Basic configuration options.\n\nThese are the basic settings.",
        description: "Basic configuration guide",
        path: "docs/basic/configuration.md",
        title: "Configuration",
        url: "https://example.com/docs/basic/configuration",
      },
      {
        content: "Different configuration options.\n\nThese are different settings.",
        description: "Different configuration guide",
        path: "docs/basic/configuration.md", // Same path, different content
        title: "Different Configuration",
        url: "https://example.com/docs/basic/configuration",
      },
    ],
    expectedPaths: ["basic/configuration.md", "basic/configuration-2.md"],
    name: "Duplicate paths handling",
    siteUrl: "https://example.com",
  },
  {
    docs: [
      {
        content: "This is a troubleshooting guide.\n\nCommon issues and solutions.",
        description: "How to troubleshoot common issues",
        path: "",
        title: "Troubleshooting Guide",
        url: "https://example.com/troubleshooting",
      },
    ],
    expectedPaths: ["troubleshooting-guide.md"],
    name: "Empty path fallback to title",
    siteUrl: "https://example.com",
  },
  {
    docs: [
      {
        content: "Get started quickly with our platform.\n\nJust a few simple steps.",
        description: "Quick start guide for new users",
        path: "docs/quick-start.md",
        title: "Quick Start",
        url: "https://example.com/docs/quick-start",
      },
      {
        content: "First tutorial in our series.\n\nLearn the basics here.",
        description: "Basic tutorial for beginners",
        path: "docs/tutorials/tutorial-1.md",
        title: "Tutorial #1",
        url: "https://example.com/docs/tutorials/tutorial-1",
      },
      {
        content: "Second tutorial building on the first.\n\nAdvanced concepts covered.",
        description: "Advanced tutorial building on basics",
        path: "guides/advanced/tutorial-2.md",
        title: "Tutorial #2",
        url: "https://example.com/guides/advanced/tutorial-2",
      },
    ],
    expectedPaths: ["quick-start.md", "tutorials/tutorial-1.md", "guides/advanced/tutorial-2.md"],
    name: "Mixed directory structures",
    siteUrl: "https://example.com",
  },
  {
    docs: [
      {
        content: "Content in a deeply nested structure.\n\nThis tests deep directory creation.",
        description: "Testing deep nested paths",
        path: "docs/level1/level2/level3/document.mdx",
        title: "Deep Nested Document",
        url: "https://example.com/docs/level1/level2/level3/document",
      },
    ],
    expectedPaths: ["level1/level2/level3/document.md"], // .mdx becomes .md
    name: "Deep nested structure with extension normalization",
    siteUrl: "https://example.com",
  },
];

async function runIndividualMarkdownGenerationTests() {
  console.log("Running individual markdown file generation tests...\n");

  let passed = 0;
  let failed = 0;

  // Create a temporary test directory
  const testDir = path.join(__dirname, "test-markdown-generation");

  // Clean up and create test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  try {
    for (const testCase of testCases) {
      console.log(`Test: ${testCase.name}`);

      try {
        // Generate individual markdown files
        const result = await generateIndividualMarkdownFiles(
          testCase.docs,
          testDir,
          testCase.siteUrl,
          "docs", // Use 'docs' as the default for tests
          [], // No frontmatter preservation for basic tests
        );

        // Check that the expected files were created at the correct paths
        let pathsCorrect = true;
        const createdFiles = [];

        for (let i = 0; i < testCase.expectedPaths.length; i++) {
          const expectedPath = testCase.expectedPaths[i];
          const fullPath = path.join(testDir, expectedPath);

          if (!fs.existsSync(fullPath)) {
            console.log(`❌ FAIL - Expected file at path "${expectedPath}" not found`);
            pathsCorrect = false;
            break;
          }

          createdFiles.push(expectedPath);
        }

        if (!pathsCorrect) {
          failed++;
          // Clean up for next test
          await cleanupTestDirectory(testDir);
          continue;
        }

        // Check URL generation in returned docs
        let urlsCorrect = true;
        for (let i = 0; i < result.length; i++) {
          const doc = result[i];
          const expectedPath = testCase.expectedPaths[i];
          const expectedUrl = `${testCase.siteUrl}/${expectedPath}`;
          if (doc.url !== expectedUrl) {
            console.log(`❌ FAIL - Expected URL "${expectedUrl}", got "${doc.url}"`);
            urlsCorrect = false;
            break;
          }
        }

        if (!urlsCorrect) {
          failed++;
          await cleanupTestDirectory(testDir);
          continue;
        }

        // Check file contents
        let contentsCorrect = true;
        for (let i = 0; i < testCase.expectedPaths.length; i++) {
          const expectedPath = testCase.expectedPaths[i];
          const filepath = path.join(testDir, expectedPath);

          if (!fs.existsSync(filepath)) {
            console.log(`❌ FAIL - Generated file "${expectedPath}" does not exist`);
            contentsCorrect = false;
            break;
          }

          const fileContent = fs.readFileSync(filepath, "utf-8");
          const originalDoc = testCase.docs[i];

          // Check that file contains expected elements
          if (!fileContent.includes(`# ${originalDoc.title}`)) {
            console.log(`❌ FAIL - File content missing title: "${originalDoc.title}"`);
            contentsCorrect = false;
            break;
          }

          if (originalDoc.description && !fileContent.includes(`> ${originalDoc.description}`)) {
            console.log(`❌ FAIL - File content missing description: "${originalDoc.description}"`);
            contentsCorrect = false;
            break;
          }

          if (!fileContent.includes(originalDoc.content)) {
            console.log(`❌ FAIL - File content missing original content`);
            contentsCorrect = false;
            break;
          }
        }

        if (!contentsCorrect) {
          failed++;
          await cleanupTestDirectory(testDir);
          continue;
        }

        // Check path updates in returned docs
        let docPathsCorrect = true;
        for (let i = 0; i < result.length; i++) {
          const doc = result[i];
          const expectedPath = `/${testCase.expectedPaths[i]}`;
          if (doc.path !== expectedPath) {
            console.log(`❌ FAIL - Expected doc path "${expectedPath}", got "${doc.path}"`);
            docPathsCorrect = false;
            break;
          }
        }

        if (docPathsCorrect) {
          console.log(`✅ PASS`);
          passed++;
        } else {
          failed++;
        }

        // Clean up for next test
        await cleanupTestDirectory(testDir);
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        failed++;
      }
    }
  } finally {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  }

  // Summary
  console.log(`\n========================================`);
  console.log(`Individual Markdown Generation Tests Summary:`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`========================================\n`);

  return failed === 0;
}

// Test edge cases
async function testEdgeCases() {
  console.log("Running edge case tests...\n");

  let passed = 0;
  let failed = 0;

  const testDir = path.join(__dirname, "test-edge-cases");

  // Clean up and create test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const edgeCases = [
    {
      docs: [],
      expectedPaths: [],
      name: "Empty docs array",
    },
    {
      docs: [
        {
          content: "Content without description",
          description: "",
          path: "docs/no-desc.md",
          title: "No Description",
          url: "https://example.com/docs/no-desc",
        },
      ],
      expectedPaths: ["no-desc.md"],
      name: "Doc with no description",
    },
    {
      docs: [
        {
          content: "Content with special path",
          description: "Testing special characters",
          path: "docs/special-chars/file.with.dots.md",
          title: "Special Path",
          url: "https://example.com/docs/special",
        },
      ],
      expectedPaths: ["special-chars/file.with.dots.md"],
      name: "Doc with special characters in path",
    },
  ];

  try {
    for (const testCase of edgeCases) {
      console.log(`Edge Case Test: ${testCase.name}`);

      try {
        const result = await generateIndividualMarkdownFiles(
          testCase.docs,
          testDir,
          "https://example.com",
          "docs", // Use 'docs' as the default for tests
          [], // No frontmatter preservation for edge case tests
        );

        // Check that all expected paths exist
        let allPathsExist = true;
        for (const expectedPath of testCase.expectedPaths) {
          const fullPath = path.join(testDir, expectedPath);
          if (!fs.existsSync(fullPath)) {
            console.log(`❌ FAIL - Expected path "${expectedPath}" not found`);
            allPathsExist = false;
            break;
          }
        }

        if (allPathsExist && result.length === testCase.expectedPaths.length) {
          console.log(`✅ PASS`);
          passed++;
        } else {
          console.log(`❌ FAIL - Expected ${testCase.expectedPaths.length} files, got ${result.length}`);
          failed++;
        }

        // Clean up for next test
        await cleanupTestDirectory(testDir);
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        failed++;
      }
    }
  } finally {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  }

  console.log(`\nEdge Case Results: ${passed} of ${edgeCases.length} tests passed.`);
  return failed === 0;
}

// Test keepFrontMatter functionality
async function testKeepFrontMatter() {
  console.log("Running keepFrontMatter tests...\n");

  let passed = 0;
  let failed = 0;

  const testDir = path.join(__dirname, "test-frontmatter");

  // Clean up and create test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const frontmatterTestCases = [
    {
      docs: [
        {
          content: "Test content here.",
          description: "Test description",
          frontMatter: {
            author: "Test Author",
            keywords: ["test", "frontmatter"],
            sidebar_label: "Custom Label",
          },
          path: "docs/test.md",
          title: "Test Document",
          url: "https://example.com/test",
        },
      ],
      expectedFrontmatter: {},
      expectedPaths: ["test.md"],
      keepFrontMatter: [],
      name: "No frontmatter preservation (empty array)",
    },
    {
      docs: [
        {
          content: "API documentation content.",
          description: "Complete API guide",
          frontMatter: {
            author: "API Team",
            custom_field: "custom_value",
            draft: false,
            keywords: ["api", "reference", "documentation"],
            sidebar_label: "API Reference",
            tags: ["guide", "api"],
          },
          path: "docs/api-guide.md",
          title: "API Guide",
          url: "https://example.com/api-guide",
        },
      ],
      expectedFrontmatter: {
        keywords: ["api", "reference", "documentation"],
        sidebar_label: "API Reference",
        tags: ["guide", "api"],
      },
      expectedPaths: ["api-guide.md"],
      keepFrontMatter: ["sidebar_label", "keywords", "tags"],
      name: "Basic frontmatter preservation",
    },
    {
      docs: [
        {
          content: "Complete guide content.",
          description: "A complete guide to everything",
          frontMatter: {
            author: "Documentation Team",
            difficulty_level: "beginner",
            draft: false,
            keywords: ["complete", "guide"],
            sidebar_label: "Complete Reference",
            sidebar_position: 1,
            tags: ["tutorial", "comprehensive"],
          },
          path: "docs/complete-guide.md",
          title: "Complete Guide",
          url: "https://example.com/complete-guide",
        },
      ],
      expectedFrontmatter: {
        author: "Documentation Team",
        difficulty_level: "beginner",
        draft: false,
        keywords: ["complete", "guide"],
        sidebar_label: "Complete Reference",
        sidebar_position: 1,
        tags: ["tutorial", "comprehensive"],
      },
      expectedPaths: ["complete-guide.md"],
      keepFrontMatter: ["sidebar_label", "sidebar_position", "keywords", "tags", "author", "draft", "difficulty_level"],
      name: "All frontmatter fields preserved",
    },
    {
      docs: [
        {
          content: "Partial frontmatter content.",
          description: "Testing partial field selection",
          frontMatter: {
            keywords: ["partial", "test"],
            sidebar_label: "Partial Label",
          },
          path: "docs/partial.md",
          title: "Partial Fields",
          url: "https://example.com/partial",
        },
      ],
      expectedFrontmatter: {
        keywords: ["partial", "test"],
        sidebar_label: "Partial Label",
      },
      expectedPaths: ["partial.md"],
      keepFrontMatter: ["sidebar_label", "keywords", "non_existent_field", "another_missing"],
      name: "Non-existent fields ignored",
    },
    {
      docs: [
        {
          content: "Testing mixed data types in frontmatter.",
          description: "Mixed data types test",
          frontMatter: {
            is_published: true,
            metadata: {
              author_email: "test@example.com",
              version: "1.0.0",
            },
            position: 42,
            tags: ["array", "values"],
            title_override: "String Value",
          },
          path: "docs/mixed-types.md",
          title: "Mixed Types",
          url: "https://example.com/mixed-types",
        },
      ],
      expectedFrontmatter: {
        is_published: true,
        metadata: {
          author_email: "test@example.com",
          version: "1.0.0",
        },
        position: 42,
        tags: ["array", "values"],
        title_override: "String Value",
      },
      expectedPaths: ["mixed-types.md"],
      keepFrontMatter: ["title_override", "position", "is_published", "tags", "metadata"],
      name: "Mixed data types handling",
    },
  ];

  try {
    for (const testCase of frontmatterTestCases) {
      console.log(`Frontmatter Test: ${testCase.name}`);

      try {
        const _result = await generateIndividualMarkdownFiles(
          testCase.docs,
          testDir,
          "https://example.com",
          "docs",
          testCase.keepFrontMatter,
        );

        // Check that files were created
        let filesExist = true;
        for (const expectedPath of testCase.expectedPaths) {
          const fullPath = path.join(testDir, expectedPath);
          if (!fs.existsSync(fullPath)) {
            console.log(`❌ FAIL - Expected file "${expectedPath}" not found`);
            filesExist = false;
            break;
          }
        }

        if (!filesExist) {
          failed++;
          await cleanupTestDirectory(testDir);
          continue;
        }

        // Check frontmatter content
        let frontmatterCorrect = true;
        for (let i = 0; i < testCase.expectedPaths.length; i++) {
          const expectedPath = testCase.expectedPaths[i];
          const filepath = path.join(testDir, expectedPath);
          const fileContent = fs.readFileSync(filepath, "utf-8");

          const expectedKeys = Object.keys(testCase.expectedFrontmatter);

          if (expectedKeys.length === 0) {
            // Should not have frontmatter
            if (fileContent.startsWith("---")) {
              console.log(`❌ FAIL - Unexpected frontmatter found when none expected`);
              frontmatterCorrect = false;
              break;
            }
          } else {
            // Should have frontmatter
            if (!fileContent.startsWith("---")) {
              console.log(`❌ FAIL - Expected frontmatter not found`);
              frontmatterCorrect = false;
              break;
            }

            // Parse frontmatter manually for validation
            const matter = require("gray-matter");
            const parsedContent = matter(fileContent);

            // Check each expected field
            for (const [key, expectedValue] of Object.entries(testCase.expectedFrontmatter)) {
              if (!(key in parsedContent.data)) {
                console.log(`❌ FAIL - Missing frontmatter field: ${key}`);
                frontmatterCorrect = false;
                break;
              }

              const actualValue = parsedContent.data[key];
              if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
                console.log(`❌ FAIL - Frontmatter field "${key}" mismatch:`);
                console.log(`   Expected: ${JSON.stringify(expectedValue)}`);
                console.log(`   Actual: ${JSON.stringify(actualValue)}`);
                frontmatterCorrect = false;
                break;
              }
            }

            if (!frontmatterCorrect) break;

            // Check that no unexpected fields are present
            const actualKeys = Object.keys(parsedContent.data);
            for (const actualKey of actualKeys) {
              if (!expectedKeys.includes(actualKey)) {
                console.log(`❌ FAIL - Unexpected frontmatter field: ${actualKey}`);
                frontmatterCorrect = false;
                break;
              }
            }
          }
        }

        if (frontmatterCorrect) {
          console.log(`✅ PASS`);
          passed++;
        } else {
          failed++;
        }

        // Clean up for next test
        await cleanupTestDirectory(testDir);
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        failed++;
      }
    }
  } finally {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  }

  console.log(`\nFrontmatter Test Results: ${passed} of ${frontmatterTestCases.length} tests passed.`);
  return failed === 0;
}

// Run all tests
async function runAllTests() {
  const mainTestsPass = await runIndividualMarkdownGenerationTests();
  const edgeTestsPass = await testEdgeCases();
  const frontmatterTestsPass = await testKeepFrontMatter();

  if (mainTestsPass && edgeTestsPass && frontmatterTestsPass) {
    console.log("🎉 All individual markdown generation tests passed!");
  } else {
    console.log("❌ Some individual markdown generation tests failed.");
    process.exit(1);
  }
}

// Execute tests
runAllTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});
