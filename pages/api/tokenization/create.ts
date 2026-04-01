import type { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentData } = req.body;

    if (!paymentData) {
      return res.status(400).json({ error: "Payment data is required" });
    }

    // Call the Convex tokenization mutation
    const result = await api.tokenization.createPaymentToken({
      paymentData,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Tokenization API error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}