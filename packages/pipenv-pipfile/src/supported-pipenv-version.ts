export function isPipenvSupportedVersion(
  version: string,
): { supported: boolean; versions: string[] } {
  // https://pipenv.pypa.io/en/latest/changelog/
  const SUPPORTED_PIPENV_VERSIONS = [
    '2020.11.4',
    '2020.8.13',
    '2020.6.2',
    '2020.5.28',
    '2018.11.26',
    '2018.11.14',
    '2018.10.13',
    '2018.10.9',
    '2018.7.1',
    '2018.6.25',
  ];
  let supported = false;
  if (SUPPORTED_PIPENV_VERSIONS.includes(version)) {
    supported = true;
  }

  return {
    supported,
    versions: SUPPORTED_PIPENV_VERSIONS,
  };
}
