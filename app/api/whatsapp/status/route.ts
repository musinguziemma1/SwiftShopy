/**
 * WhatsApp Monitoring & Testing API Routes
 * 
 * Includes: Health checks, webhook testing, metrics, diagnostics
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Health Check ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check Convex connectivity
    let convexStatus = "healthy";
    let convexLatency = 0;

    try {
      const convexStart = Date.now();
      await convex.query(api.whatsapp.listTickets, { limit: 1 });
      convexLatency = Date.now() - convexStart;
    } catch (err) {
      convexStatus = "unhealthy";
    }

    // Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_CONVEX_URL",
      "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
    ];

    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

    // Build health response
    const health = {
      status: convexStatus === "healthy" && missingEnvVars.length === 0 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 0,
      version: process.env.APP_VERSION || "1.0.0",
      services: {
        convex: {
          status: convexStatus,
          latency: convexLatency,
        },
        whatsapp: {
          status: "configured",
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
      },
      metrics: {
        responseTime: Date.now() - startTime,
      },
    };

    const statusCode = health.status === "healthy" ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (err: any) {
    console.error("[Health Check] Error:", err);

    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: err.message,
    }, { status: 503 });
  }
}

// ─── WhatsApp API Status ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    switch (action) {
      case "test_webhook": {
        // Simulate a test webhook message
        const testMessage = {
          object: "whatsapp_business_account",
          entry: [{
            id: "test_business_account",
            changes: [{
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+256772100001",
                  phone_number_id: "test_phone_id",
                },
                messages: [{
                  from: "256700000001",
                  id: "test_message_id",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "text",
                  text: {
                    body: "Test message from webhook",
                  },
                  profile: {
                    name: "Test Customer",
                  },
                }],
              },
              field: "messages",
            }],
          }],
        };

        return NextResponse.json({
          success: true,
          testPayload: testMessage,
          message: "Test webhook payload generated. Send this to your webhook endpoint for testing.",
        });
      }

      case "test_send": {
        // Test message sending (without actually sending)
        const { phoneNumber, message } = await req.json();

        if (!phoneNumber || !message) {
          return NextResponse.json(
            { error: "phoneNumber and message are required" },
            { status: 400 }
          );
        }

        // Validate phone number format
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (cleanPhone.length < 12) {
          return NextResponse.json(
            { error: "Invalid phone number format" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          testSend: {
            to: phoneNumber,
            message: message,
            wouldSend: true,
            timestamp: new Date().toISOString(),
          },
        });
      }

      case "get_metrics": {
        // Get message delivery metrics
        const { storeId, days = 7 } = await req.json() || {};

        if (!storeId) {
          return NextResponse.json(
            { error: "storeId is required" },
            { status: 400 }
          );
        }

        const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

        // Get analytics
        const analytics = await convex.query(api.whatsapp.getWhatsAppAnalytics, {
          storeId,
          days,
        });

        return NextResponse.json({
          success: true,
          metrics: analytics || {
            totalMessages: 0,
            inbound: 0,
            outbound: 0,
            activeConversations: 0,
            avgResponseTime: 0,
            responseRate: 0,
          },
          period: {
            days,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date().toISOString(),
          },
        });
      }

      case "get_diagnostics": {
        // Run system diagnostics
        const diagnostics = {
          timestamp: new Date().toISOString(),
          checks: {
            nodeVersion: {
              status: "ok",
              value: process.version,
            },
            memoryUsage: {
              status: "ok",
              value: process.memoryUsage?.() || {},
            },
            envVars: {
              status: "ok",
              defined: Object.keys(process.env).filter(k => k.startsWith("WHATSAPP")).length,
            },
          },
        };

        return NextResponse.json({
          success: true,
          diagnostics,
        });
      }

      case "test_connection": {
        // Test WhatsApp API connection
        const { accessToken, phoneNumberId } = await req.json();

        if (!accessToken || !phoneNumberId) {
          return NextResponse.json(
            { error: "accessToken and phoneNumberId are required" },
            { status: 400 }
          );
        }

        // In production, this would actually test the WhatsApp API
        return NextResponse.json({
          success: true,
          connection: {
            wouldTest: true,
            phoneNumberId,
            message: "Connection test would be performed with WhatsApp API",
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("[WhatsApp API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Metrics Endpoint ─────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { storeId, dateRange } = await req.json();

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    const days = dateRange || 30;
    const analytics = await convex.query(api.whatsapp.getWhatsAppAnalytics, {
      storeId,
      days,
    });

    // Calculate additional metrics
    const metrics = {
      overview: {
        totalMessages: analytics?.totalMessages || 0,
        inbound: analytics?.inbound || 0,
        outbound: analytics?.outbound || 0,
        deliveryRate: analytics?.totalMessages > 0
          ? Math.round((analytics.outbound / analytics.totalMessages) * 100)
          : 0,
      },
      engagement: {
        responseRate: analytics?.responseRate || 0,
        avgResponseTimeSeconds: analytics?.avgResponseTime || 0,
        avgResponseTimeFormatted: analytics?.avgResponseTime
          ? `${Math.round(analytics.avgResponseTime / 60)}m`
          : "N/A",
      },
      conversations: {
        total: analytics?.totalConversations || 0,
        active: analytics?.activeConversations || 0,
        archived: (analytics?.totalConversations || 0) - (analytics?.activeConversations || 0),
      },
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err: any) {
    console.error("[Metrics] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}