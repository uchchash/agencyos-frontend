
// Copied from https://www.npmjs.com/package/jwt-decode

export class InvalidTokenError extends Error { }

InvalidTokenError.prototype.name = "InvalidTokenError";

function b64Decode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  let newStr = base64;
  switch (base64.length % 4) {
    case 0:
      break;
    case 2:
      newStr += "==";
      break;
    case 3:
      newStr += "=";
      break;
    default:
      throw new Error("Invalid token");
  }

  try {
    return Buffer.from(newStr, 'base64').toString('binary');
  } catch (err) {
    return atob(newStr);
  }
}

interface JwtDecodeOptions {
  header?: boolean;
}

export function jwtDecode<T = unknown>(token: string, options?: JwtDecodeOptions): T {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }

  options = options || {};
  let pos = options.header === true ? 0 : 1;

  try {
    let part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(`Invalid token specified: missing part #${pos}`);
    }
    let decoded = b64Decode(part);
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos}`);
    }
  } catch (e) {
    throw new InvalidTokenError(`Invalid token specified: ${(e as Error).message}`);
  }
}
