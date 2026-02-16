---
title: "Send Reminder"
api: "POST https://calendrian.vercel.app/api/send"
description: "Send a calendar invitation to a list of recipients."
---

### Body

<ParamField body="emails" type="string[]" required>
  An array of email addresses to send the invitation to.
</ParamField>

<ParamField body="eventDetails" type="object" required>
  <Expandable title="properties">
    <ParamField body="title" type="string" required>
      The summary/title of the calendar event.
    </ParamField>
    <ParamField body="description" type="string" required>
      The description of the event. Supports some HTML tags.
    </ParamField>
    <ParamField body="startDate" type="string" required>
      ISO 8601 string representing the start date and time.
    </ParamField>
    <ParamField body="endDate" type="string" required>
      ISO 8601 string representing the end date and time.
    </ParamField>
    <ParamField body="location" type="string">
      Physical location or URL for the event.
    </ParamField>
    <ParamField body="userTimezone" type="string">
      The timezone of the event (e.g., "America/New_York"). Defaults to "UTC".
    </ParamField>
    <ParamField body="scheduledAt" type="string">
      ISO 8601 string. If provided, the reminder will be queued and sent at this specific time.
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="refreshToken" type="string">
  The Google OAuth2 refresh token for the account sending the invites. If omitted, the default system account is used.
</ParamField>

<ParamField body="visitorToken" type="string" required>
  A unique identifier for the user or session.
</ParamField>

### Response

<ResponseField name="success" type="boolean">
  Indicates if the request was successful.
</ResponseField>

<ResponseField name="eventId" type="string">
  The unique ID of the created Google Calendar event (returned for immediate sends).
</ResponseField>

<ResponseField name="link" type="string">
  The HTML link to the Google Calendar event.
</ResponseField>

<ResponseField name="scheduled" type="boolean">
  Set to `true` if the event was queued for future delivery.
</ResponseField>

<RequestExample>

```bash
curl --request POST \
  --url https://calendrian.vercel.app/api/send \
  --header 'Content-Type: application/json' \
  --data '{
  "emails": ["user@example.com"],
  "eventDetails": {
    "title": "Welcome to Calendrian",
    "description": "Glad to have you on board!",
    "startDate": "2026-02-20T10:00:00Z",
    "endDate": "2026-02-20T11:00:00Z",
    "location": "Online",
    "userTimezone": "UTC"
  },
  "visitorToken": "v_123456"
}'
```

</RequestExample>
