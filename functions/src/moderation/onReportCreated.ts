import * as functions from "firebase-functions/v2";
import { db } from "../lib/firebase";
import { getResend } from "../lib/resend";

export const onReportCreated = functions.firestore.onDocumentCreated(
  {
    document: "reports/{reportId}",
    region: "australia-southeast1",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const report = event.data?.data();
    if (!report) return;

    const reportId = event.params.reportId;

    try {
      const reviewSnap = await db.collection("reviews").doc(report.reviewId).get();

      const review = reviewSnap.data();

      await getResend().emails.send({
        from: "Cones <onboarding@resend.dev>",
        to: "kompletionapps@gmail.com",
        subject: `⚠️ New Content Report — ${reportId}`,
        html: `
          <h2>New Report Received</h2>
          <table>
            <tr><td><strong>Report ID</strong></td><td>${reportId}</td></tr>
            <tr><td><strong>Review ID</strong></td><td>${report.reviewId}</td></tr>
            <tr><td><strong>Author ID</strong></td><td>${report.authorId}</td></tr>
            <tr><td><strong>Reported By</strong></td><td>${report.reportedByUid}</td></tr>
            <tr><td><strong>Status</strong></td><td>${report.status}</td></tr>
            <tr><td><strong>Review Content</strong></td><td>${review?.content ?? "N/A"}</td></tr>
          </table>
          <br/>
          <a href="https://console.firebase.google.com/project/cones-app-fd230/firestore/data/reports/${reportId}">
            View in Firebase Console
          </a>
        `,
      });

      console.log(`Report email sent for report ${reportId}`);
    } catch (error) {
      console.error("Failed to send report email:", error);
    }
  },
);
