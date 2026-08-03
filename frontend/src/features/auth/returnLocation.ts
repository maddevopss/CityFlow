export type ReturnLocation = {
  pathname?: string;
  search?: string;
  hash?: string;
};

const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

const isSafePathname = (pathname: string): boolean =>
  pathname.startsWith("/") &&
  !pathname.startsWith("//") &&
  !pathname.includes("\\");

const isSafeSuffix = (value: string, prefix: "?" | "#"): boolean =>
  (value === "" || value.startsWith(prefix)) && !value.includes("\\");

export const resolveSafeReturnLocation = (
  location?: ReturnLocation,
): string => {
  const pathname = location?.pathname ?? DEFAULT_AUTHENTICATED_PATH;
  const search = location?.search ?? "";
  const hash = location?.hash ?? "";

  if (
    !isSafePathname(pathname) ||
    !isSafeSuffix(search, "?") ||
    !isSafeSuffix(hash, "#")
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return `${pathname}${search}${hash}`;
};
