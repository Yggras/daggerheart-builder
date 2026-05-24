# ADR-0007: Auth Model

Status: Accepted
Date: 2026-05-24

## Context

The project is personal use only for now. Users need accounts because characters and campaign participation belong to users. Supabase's default email provider is restricted for general auth email flows unless custom SMTP is configured.

The user prefers email/password authentication first and is comfortable manually creating users and passwords in Supabase.

## Decision

Use Supabase email/password authentication with admin-managed accounts.

Initial auth behavior:

- App signup is disabled.
- Users are manually created in the Supabase dashboard.
- Initial passwords are manually set by the admin.
- No outbound auth emails are required initially.
- Password reset is manually handled by the admin.
- The app should provide a login screen only, not signup or forgot-password flows.

## Consequences

- No custom SMTP setup is required for the MVP.
- The app avoids relying on Supabase's restricted default email provider.
- Access remains controlled for personal-use groups.
- Users cannot self-register.
- Users cannot self-serve password resets until a later auth upgrade.
- If the project grows beyond personal use, auth should be revisited with custom SMTP, invite flows, OAuth, or another self-service approach.
