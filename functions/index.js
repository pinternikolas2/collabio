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
 * 2. Gemini AI Assistant
 * Call from frontend: const { content } = await chatWithAI({ message: "Hello", history: [] });
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chatWithAI = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { message, history = [] } = data;

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini.key;
    if (!apiKey) {
        throw new functions.https.HttpsError("failed-precondition", "Gemini API Key is missing.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Convert history to Gemini format if needed, or just use the latest message for simplicity in this turn
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return {
            role: "assistant",
            content: text
        };
    } catch (error) {
        console.error("Gemini Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

/**
 * 3. Securely get user email (Example of Admin SDK usage)
 */
exports.getUserEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) return null;
    const userRecord = await admin.auth().getUser(context.auth.uid);
    return { email: userRecord.email };
});
