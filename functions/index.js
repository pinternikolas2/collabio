const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a notification in the 'notifications' collection.
 */
async function createNotification(userId, type, title, message, relatedId = null, relatedType = null) {
    try {
        await db.collection("notifications").add({
            userId,
            type,
            title,
            message,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            relatedId,
            relatedType,
        });
        console.log(`Notification created for user ${userId}: ${type}`);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// ============================================================================
// NOTIFICATION TRIGGERS
// ============================================================================

/**
 * Trigger: When a new message is created in 'messages' collection.
 * Action: Send notification to the recipient.
 */
exports.onmessagecreated = onDocumentCreated("messages/{messageId}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const message = snap.data();
    const { toUserId, fromUserId, content, chatId } = message;

    if (!toUserId || !fromUserId) return;

    // Avoid notifying if user is chatting with themselves (unlikely but possible)
    if (toUserId === fromUserId) return;

    try {
        // Get sender details for the notification text
        const senderSnap = await db.collection("users").doc(fromUserId).get();
        const senderName = senderSnap.exists
            ? (senderSnap.data().companyName || `${senderSnap.data().firstName} ${senderSnap.data().lastName}`)
            : "Někdo";

        await createNotification(
            toUserId,
            "message",
            `Nová zpráva od ${senderName}`,
            content.length > 50 ? content.substring(0, 50) + "..." : content,
            chatId,
            "chat"
        );

        // Also update chat unread count
        const chatRef = db.collection("chats").doc(chatId);
        await chatRef.update({
            [`unreadCounts.${toUserId}`]: admin.firestore.FieldValue.increment(1),
            lastMessage: content,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error("Error in onMessageCreated:", error);
    }
});

/**
 * Trigger: When a new collaboration (offer) is created.
 * Action: Notify the recipient (e.g., Talent receiving an offer).
 */
exports.oncollaborationcreated = onDocumentCreated("collaborations/{collabId}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const collab = snap.data();

    // Check if projectId exists
    if (!collab.projectId) return;

    const projectSnap = await db.collection("projects").doc(collab.projectId).get();
    const project = projectSnap.data();

    if (collab.talentId) {
        await createNotification(
            collab.talentId,
            "offer",
            "Nová nabídka spolupráce",
            `Obdrželi jste nabídku k projektu "${project ? project.title : 'Nový projekt'}"`,
            event.params.collabId,
            "collaboration"
        );
    }
});

/**
 * Trigger: When a collaboration status changes (e.g., pending -> accepted).
 * Action: Notify the other party.
 */
exports.oncollaborationupdated = onDocumentUpdated("collaborations/{collabId}", async (event) => {
    const newData = event.data.after.data();
    const previousData = event.data.before.data();

    if (!newData || !previousData) return;
    if (newData.status === previousData.status) return;

    const talentId = newData.talentId;
    const companyId = newData.companyId;

    if (newData.status === 'accepted') {
        if (companyId) {
            await createNotification(
                companyId,
                "collaboration_update",
                "Spolupráce přijata!",
                `Talent přijal vaši nabídku.`,
                event.params.collabId,
                "collaboration"
            );
        }
    } else if (newData.status === 'rejected') {
        if (companyId) {
            await createNotification(
                companyId,
                "collaboration_update",
                "Spolupráce zamítnuta",
                `Talent nabídku odmítl.`,
                event.params.collabId,
                "collaboration"
            );
        }
    }
});

// ============================================================================
// ANALYTICS & AGGREGATION TRIGGERS
// ============================================================================

/**
 * Trigger: When a new rating is created.
 * Action: Recalculate average rating for the target user.
 */
exports.onratingcreated = onDocumentCreated("ratings/{ratingId}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rating = snap.data();
    const targetUserId = rating.toUserId;

    if (!targetUserId) return;

    const userRef = db.collection("users").doc(targetUserId);

    try {
        await db.runTransaction(async (transaction) => {
            // 1. Get all ratings for this user
            const ratingsQuery = db.collection("ratings").where("toUserId", "==", targetUserId);
            const ratingsSnap = await transaction.get(ratingsQuery);

            if (ratingsSnap.empty) return;

            let totalScore = 0;
            let count = 0;

            ratingsSnap.forEach(doc => {
                const r = doc.data();
                totalScore += (r.rating || 0);
                count++;
            });

            const average = count > 0 ? totalScore / count : 0;

            // 2. Update user document
            transaction.update(userRef, {
                rating: average,
                ratingCount: count,
                lastRatingUpdate: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log(`Updated rating for user ${targetUserId}`);
    } catch (error) {
        console.error("Error updating average rating:", error);
    }
});

/**
 * Trigger: When a new user creates an account.
 * Action: Increment global user counter (for Admin Dashboard).
 */
exports.aggregateplatformstats = onDocumentCreated("users/{userId}", async (event) => {
    const statsRef = db.collection("stats").doc("platform");

    try {
        await statsRef.set({
            totalUsers: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error aggregating user stats:", error);
    }
});


// ============================================================================
// UTILS
// ============================================================================

exports.ping = onCall((request) => {
    return { message: "pong", timestamp: new Date().toISOString() };
});
