# Changelog

> [!NOTE]
>
> Versioning begins at 0.3.0 because this is a fork of the
> [`docusaurus-plugin-llms`](https://github.com/rachfop/docusaurus-plugin-llms) created by Patrick Rachford. For
> previous versions, check out the [CHANGELOG](https://github.com/rachfop/docusaurus-plugin-llms/blob/main/CHANGELOG.md)
> in the original repo.

All notable changes to the docusaurus-plugin-llms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[0.3.1]: https://github.com/sablier-labs/docusaurus-plugin-llms/releases/tag/v0.3.1
[0.3.0]: https://github.com/sablier-labs/docusaurus-plugin-llms/releases/tag/v0.3.0

## [0.3.1] - 2025-11-15

### Changed

- Update README and CHANGELOG.

## [0.3.0] - 2025-10-20

### Changed

- The markdown filenames use frontmatter's `slug` as the default option. If the `slug` is missing, it fallbacks to
  frontmatter's `id`. If `id` is missing, it fallbacks to the file name.

### Added

- New option `ignoreHtml` to ignore files with HTML tags in their descriptions
