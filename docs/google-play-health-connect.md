# Google Play Health Connect Notes

Use this when filling the Google Play Console health app and privacy declarations for Ripple.

## App Identity

- Android package: `com.knguyencas.ripple`
- Privacy policy URL after backend deploy: `https://<render-backend-domain>/privacy`
- Backend route provided by Ripple API: `/privacy` and `/privacy-policy`

## Requested Health Connect Access

Ripple requests read-only access to:

- Steps: used to show daily step count and historical wellness summaries.
- Sleep: used to show sleep sessions, sleep duration, and historical wellness summaries.

Ripple does not request Health Connect write access. The app should not declare:

- `android.permission.health.WRITE_STEPS`
- `android.permission.health.WRITE_SLEEP`

## User-Facing Purpose

Ripple uses Health Connect data only after the user grants permission. Health data is used to personalize in-app habit tracking, mood context, and wellness summaries. It is not sold, not used for advertising, and not shared for unrelated purposes.

## Data Handling

- Steps and sleep data may be synced to the Ripple backend for the signed-in user's history.
- Users can decline or revoke Health Connect permissions.
- Users can request account deletion or data deletion through the support contact in the privacy policy.

## Play Console Checklist

- Add the public privacy policy URL.
- Declare read access for Steps.
- Declare read access for Sleep.
- Explain that access is user-initiated and used for habit tracking/wellness summaries.
- Do not declare write permissions unless Ripple later implements writing data back to Health Connect.
