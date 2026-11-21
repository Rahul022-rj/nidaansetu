// Usage: npm run create-admin -- --email owner@example.com --name "Owner Name"
// Prompts for the password (not echoed). The only way to create a super_admin.
import { parseArgs } from "node:util";
import readline from "node:readline";
import { z } from "zod";
import { connectDb, disconnectDb } from "../db.js";
import { User } from "../models/index.js";
import { hashPassword } from "../lib/crypto.js";
import { audit } from "../lib/audit.js";

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
const args = z
  .object({ email: z.string().trim().toLowerCase().email("--email must be a valid email"), name: z.string().trim().min(2, "--name is required") })
  .safeParse(values);
if (!args.success) {
  console.error(args.error.issues.map((i) => i.message).join("\n"));
  console.error('Usage: npm run create-admin -- --email you@example.com --name "Your Name"');
  process.exit(1);
}

function askHidden(question) {
  // Non-interactive use (CI, Docker): read from ADMIN_PASSWORD
  if (!process.stdin.isTTY) return Promise.resolve(process.env.ADMIN_PASSWORD || "");
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.startsWith(question)) rl.output.write(question);
      else rl.output.write("*");
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await askHidden("Password (min 12 chars): ");
if (password.length < 12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
  console.error("Password must be at least 12 characters with letters and digits.");
  process.exit(1);
}
if (process.stdin.isTTY && (await askHidden("Confirm password: ")) !== password) {
  console.error("Passwords do not match.");
  process.exit(1);
}

await connectDb();
try {
  const existing = await User.findOne({ email: args.data.email });
  if (existing) {
    console.error(`A user with ${args.data.email} already exists (role: ${existing.role}). Nothing changed.`);
    process.exitCode = 1;
  } else {
    const user = await User.create({ ...args.data, role: "super_admin", passwordHash: await hashPassword(password) });
    await audit({ user, ip: "cli" }, { action: "user.create_super_admin", entityType: "User", entityId: user._id, after: { email: user.email, name: user.name } });
    console.log(`Super admin created: ${user.email}`);
  }
} finally {
  await disconnectDb();
}
