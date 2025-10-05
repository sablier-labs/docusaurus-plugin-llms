# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"
import "./node_modules/@sablier/devkit/just/npm.just"

# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

cleanup:
    bun cleanup.js

[group("test")]
test: tsc-build test-unit test-integration

[group("test")]
test-unit:
    bun tests/test-path-transforms.js
    bun tests/test-header-deduplication.js
    bun tests/test-import-removal.js
    bun tests/test-partials.js
    bun tests/test-root-content.js
    bun tests/test-filenames.js

[group("test")]
test-integration:
    bun tests/test-path-transformation.js

watch:
    tsc --watch
