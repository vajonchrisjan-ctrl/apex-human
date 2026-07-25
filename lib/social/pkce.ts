import "server-only";
import crypto from "node:crypto";

export function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateCodeVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

export function codeChallengeFromVerifier(verifier: string): string {
  return base64url(crypto.createHash("sha256").update(verifier).digest());
}
