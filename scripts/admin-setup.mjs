#!/usr/bin/env node
// Sets up the hidden admin login in .env.local:
//   ADMIN_PATH            secret URL of the admin panel (random unless you keep yours)
//   ADMIN_PASSWORD_HASH   scrypt hash of the password you type (the password itself is never stored)
//   ADMIN_SESSION_SECRET  random key used to sign the login cookie
// Usage: npm run admin:setup

import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env.local");

function askHidden(question) {
  return new Promise((done) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    let value = "";
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\u0003") process.exit(1); // Ctrl+C
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        done(value);
      } else if (ch === "\u007f" || ch === "\b") {
        if (value.length) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        value += ch;
        process.stdout.write("*".repeat(ch.length));
      }
    };
    stdin.on("data", onData);
  });
}

function setVar(text, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  return re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`;
}

let env = existsSync(envFile) ? readFileSync(envFile, "utf8").replace(/^﻿/, "") : "";

console.log("\nNGOConnect — admin setup\n");
const password = await askHidden("Choose an admin password (min 10 characters): ");
if (password.length < 10) {
  console.error("Too short. Use at least 10 characters (a short sentence works well).");
  process.exit(1);
}
const confirm = await askHidden("Type it again: ");
if (confirm !== password) {
  console.error("Passwords don't match. Nothing was changed.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
env = setVar(env, "ADMIN_PASSWORD_HASH", `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
env = setVar(env, "ADMIN_SESSION_SECRET", randomBytes(32).toString("base64url"));

const current = env.match(/^ADMIN_PATH=(.*)$/m)?.[1]?.trim();
const keep = current && current !== "/admin" && current !== "/studio-change-me";
const adminPath = keep ? current : `/studio-${randomBytes(4).toString("hex")}`;
env = setVar(env, "ADMIN_PATH", adminPath);

writeFileSync(envFile, env);

console.log("\nDone! Saved to .env.local.");
console.log(`\n  Your secret admin login:  ${adminPath}/login`);
console.log("\nRestart the dev server (npm run dev) so it picks up the new values.");
console.log("Keep this path private — anyone else visiting it just sees a 404 page.\n");
