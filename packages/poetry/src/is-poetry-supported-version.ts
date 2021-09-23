export function isPoetrySupportedVersion(
  version: string,
): { supported: boolean; versions: string[] } {
  // See all versions: https://github.com/python-poetry/poetry/releases
  // Update SUPPORTED.md when this is updated
  // Not all versions listed below as not all are tested but most likely
  // they are supported
  const SUPPORTED_POETRY_VERSIONS = [
    '1.1.9',
    '1.1.8',
    '1.1.7',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.0.9',
    '1.0.8',
    '1.0.7',
  ];
  let supported = false;
  if (SUPPORTED_POETRY_VERSIONS.includes(version)) {
    supported = true;
  }

  return {
    supported,
    versions: SUPPORTED_POETRY_VERSIONS,
  };
}
