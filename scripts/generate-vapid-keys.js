#!/usr/bin/env node
/**
 * generate-vapid-keys.js
 * Run once to generate VAPID keys for Web Push:
 *   node scripts/generate-vapid-keys.js
 *
 * Then copy the output into your .env.local file.
 */

const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();

console.log("\n✅ VAPID Keys generated!\n");
console.log("Add these to your .env.local:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:your@email.com`);
console.log("\n⚠️  Keep VAPID_PRIVATE_KEY secret — never commit it to git!\n");
