import { NextResponse } from "next/server";
import webpush from "web-push";

// Configure VAPID details (set these in .env.local)
webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:admin@jirorano.mg",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

/**
 * POST /api/push/subscribe
 * Body: PushSubscription JSON (endpoint, keys: {p256dh, auth})
 *
 * Saves the subscription endpoint. In production, store in Supabase.
 * For the prototype, we store in memory / respond with confirmation.
 */
export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // TODO: Persist subscription in Supabase `push_subscriptions` table:
    // const supabase = createServerClient(...)
    // await supabase.from("push_subscriptions").upsert({ endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) })

    console.log("[Push] Subscription saved:", subscription.endpoint);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[Push] Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
