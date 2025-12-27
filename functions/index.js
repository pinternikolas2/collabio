const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Lazy load Stripe to prevent deployment timeouts
const getStripe = () => {
    // Note: In production, use functions.config().stripe.secret
    return require("stripe")("sk_test_placeholder_replace_me");
};

/**
 * 1. Create Payment Intent for Stripe
 * Call from frontend: const { clientSecret } = await createPaymentIntent({ amount: 1000, currency: 'czk' });
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { amount, currency = "czk", description } = data;
    const stripe = getStripe();

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

exports.createConnectAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
    const stripe = getStripe();
    try {
        const account = await stripe.accounts.create({ type: 'express' });
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'http://localhost:5173/return',
            return_url: 'http://localhost:5173/return',
            type: 'account_onboarding',
        });
        return { url: accountLink.url, accountId: account.id };
    } catch (error) {
        console.error("Stripe Connect Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

exports.createEscrow = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
    const { amount, currency = 'czk', destinationAccountId } = data;
    const stripe = getStripe();
    try {
        const intent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
            capture_method: 'manual',
            transfer_data: { destination: destinationAccountId },
        });
        return { clientSecret: intent.client_secret, id: intent.id };
    } catch (error) {
        console.error("Escrow Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

exports.releaseEscrow = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
    const { paymentIntentId } = data;
    const stripe = getStripe();
    try {
        await stripe.paymentIntents.capture(paymentIntentId);
        return { success: true };
    } catch (error) {
        console.error("Release Escrow Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

/**
 * 2. Gemini AI Assistant
 * Call from frontend: const { content } = await chatWithAI({ message: "Hello", history: [] });
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { message, history = [] } = data;

    // Get API key from environment variables
    // Note: Ensure GEMINI_API_KEY is set in Firebase functions config or env
    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
    if (!apiKey) {
        throw new functions.https.HttpsError("failed-precondition", "Gemini API Key is missing.");
    }

    try {
        // Lazy load GoogleGenerativeAI
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Convert history to Gemini format
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
