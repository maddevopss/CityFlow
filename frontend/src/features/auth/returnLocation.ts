export type ReturnLocation = {
  pathname?: string;
  search?: string;
  hash?: string;
};

const isSafePathname = (pathname: string): boolean =>
  pathname.startsWith("/") &&
  !pathname.startsWith("//") &&
  !pathname.includes("\\");

const isSafeSuffix = (value: string, prefix: "?" | "#"): boolean =>
  (value === "" || value.startsWith(prefix)) && !value.includes("\\");

export const resolveSafeReturnLocation = (
  location?: ReturnLocation,
): string => {
  const pathname = location?.pathname ?? "/";
  const search = location?.search ?? "";
  const hash = location?.hash ?? "";

  if (
    !isSafePathname(pathname) ||
    !isSafeSuffix(search, "?") ||
    !isSafeSuffix(hash, "#")
  ) {
    return "/";
  }

  return `${pathname}${search}${hash}`;
};
