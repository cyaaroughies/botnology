import { NextResponse } from "next/server";

type CheckoutBody = {
  plan?: string;
  cadence?: string;
  student_id?: string;
  email?: string;
};

function variantEnvKey(plan: string, cadence: string): string | null {
  const p = (plan || "associates").trim().toLowerCase();
  const c = (cadence || "monthly").trim().toLowerCase();
  if (p === "associates" && c === "monthly") return "LEMON_SQUEEZY_VARIANT_ASSOCIATES_MONTHLY";
  if (p === "associates" && c === "annual") return "LEMON_SQUEEZY_VARIANT_ASSOCIATES_ANNUAL";
  if (p === "bachelors" && c === "monthly") return "LEMON_SQUEEZY_VARIANT_BACHELORS_MONTHLY";
  if (p === "bachelors" && c === "annual") return "LEMON_SQUEEZY_VARIANT_BACHELORS_ANNUAL";
  if (p === "masters" && c === "monthly") return "LEMON_SQUEEZY_VARIANT_MASTERS_MONTHLY";
  if (p === "masters" && c === "annual") return "LEMON_SQUEEZY_VARIANT_MASTERS_ANNUAL";
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const plan = (body.plan || "associates").trim().toLowerCase();
    const cadence = (body.cadence || "monthly").trim().toLowerCase();
    const studentId = (body.student_id || "BN-UNKNOWN").trim();
    const email = (body.email || "").trim() || undefined;

    const apiKey = (process.env.LEMON_SQUEEZY_API_KEY || "").trim();
    if (!apiKey) {
      return NextResponse.json({ detail: "Lemon Squeezy not configured: missing LEMON_SQUEEZY_API_KEY." }, { status: 400 });
    }

    const envKey = variantEnvKey(plan, cadence);
    if (!envKey) {
      return NextResponse.json({ detail: "Invalid plan/cadence. Expected associates|bachelors|masters with monthly|annual." }, { status: 400 });
    }

    const variantId = (process.env[envKey] || "").trim();
    if (!variantId) {
      return NextResponse.json({ detail: `Missing Lemon Squeezy variant id env var: ${envKey}.` }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const successUrl = `${origin}/pricing.html?checkout=success&plan=${encodeURIComponent(plan)}`;
    const cancelUrl = `${origin}/pricing.html?checkout=cancel`;

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          checkout_data: {
            email,
            custom: {
              student_id: studentId,
              plan,
              cadence,
            },
          },
          product_options: {
            redirect_url: successUrl,
            receipt_button_text: "Return to Botnology101",
            receipt_link_url: successUrl,
            receipt_thank_you_note: "Welcome to Botnology101.",
          },
          expires_at: null,
          preview: false,
          test_mode: ["1", "true", "yes"].includes((process.env.LEMON_SQUEEZY_TEST_MODE || "").trim().toLowerCase()),
        },
        relationships: {
          variant: {
            data: {
              type: "variants",
              id: String(variantId),
            },
          },
        },
      },
    };

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ detail: data?.errors || data?.detail || `Lemon Squeezy API error (${response.status}).` }, { status: 400 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ detail: "Lemon Squeezy did not return a checkout URL." }, { status: 400 });
    }

    return NextResponse.json({ url: checkoutUrl, cancel_url: cancelUrl });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected checkout error.";
    return NextResponse.json({ detail }, { status: 400 });
  }
}
