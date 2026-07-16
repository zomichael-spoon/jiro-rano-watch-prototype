import { NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:admin@jirorano.mg",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

interface SendPayload {
  subscription: webpush.PushSubscription;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

/**
 * POST /api/push/send
 * Sends a push notification to a specific subscription.
 *
 * Body: { subscription, title, body, url, tag }
 *
 * In production, this would be called by a Supabase webhook or Edge Function
 * whenever a new report is inserted.
 */
export async function POST(request: Request) {
  try {
    const { subscription, title, body, url, tag }: SendPayload = await request.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: title ?? "⚡ Nouvelle panne signalée",
      body: body ?? "Une coupure a été signalée dans votre zone.",
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      url: url ?? "/",
      tag: tag ?? "jiro-report",
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Push] Send error:", err);
    const status =
      err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : 500;
    return NextResponse.json({ error: "Failed to send notification" }, { status });
  }
}
