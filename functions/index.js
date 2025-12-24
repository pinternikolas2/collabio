const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Note: In production, use functions.config().stripe.secret
const stripe = require("stripe")("sk_test_placeholder_replace_me");

admin.initializeApp();

/**
 * 1. Create Payment Intent for Stripe
 * Call from frontend: const { clientSecret } = await createPaymentIntent({ amount: 1000, currency: 'czk' });
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { amount, currency = "czk", description } = data;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: { userId: context.auth.uid, description },
            automatic_payment_methods: { enabled: true },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        };
    } catch (error) {
        console.error("Stripe Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

/**
 * 2. Mock AI Assistant
 * Call from frontend for secure AI interaction
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { messages } = data;
    // TODO: Integrate real OpenAI call here
    // const completion = await openai.chat.completions.create({ ... });

    return {
        role: "assistant",
        content: "Toto je odpověď z Cloud Function (backend). Systém je připraven na integraci OpenAI."
    };
});

/**
 * 3. Securely get user email (Example of Admin SDK usage)
 */
exports.getUserEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) return null;
    const userRecord = await admin.auth().getUser(context.auth.uid);
    return { email: userRecord.email };
});
