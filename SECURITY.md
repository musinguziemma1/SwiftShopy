# Environment Variables Guide

## Required Environment Variables

### Authentication
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

### Google OAuth
```
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

### Convex
```
NEXT_PUBLIC_CONVEX_URL=<from Convex dashboard>
CONVEX_DEPLOYMENT=<from Convex dashboard>
```

### MTN Mobile Money (Production)
```
MTN_ENVIRONMENT=production
MTN_PRODUCTION_BASE_URL=https://api.momodeveloper.mtn.com
MTN_PRODUCTION_COLLECTIONS_KEY=<from MTN Developer Portal>
MTN_PRODUCTION_DISBURSEMENTS_KEY=<from MTN Developer Portal>
MTN_PRODUCTION_API_USER_ID=<from MTN Developer Portal>
MTN_PRODUCTION_API_KEY=<from MTN Developer Portal>
MTN_CALLBACK_URL=https://your-domain.com/api/webhooks/mtn
MTN_WEBHOOK_SECRET=<generate secure string>
```

### Airtel Money (Production)
```
AIRTEL_PRODUCTION_BASE_URL=https://openapi.airtel.africa
AIRTEL_CLIENT_ID=<from Airtel>
AIRTEL_CLIENT_SECRET=<from Airtel>
```

### WhatsApp Business (Production)
```
WHATSAPP_PHONE_NUMBER_ID=<from Meta Developer Portal>
WHATSAPP_ACCESS_TOKEN=<from Meta Developer Portal>
```

### Email (Production)
```
RESEND_API_KEY=<from Resend Dashboard>
EMAIL_FROM=SwiftShopy <noreply@your-domain.com>
```

## Security Notes

1. **NEVER commit .env.local to version control**
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use different secrets** for staging vs production
4. **Enable 2FA** on all admin accounts
5. **Monitor API keys** for unusual usage patterns
6. **Use HTTPS** in production (enforced by platform)

## Development vs Production

- Development uses sandbox/test credentials
- Production requires verified business accounts
- Always verify webhooks are from trusted sources
- Implement rate limiting in production