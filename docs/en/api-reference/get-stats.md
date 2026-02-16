---
title: "Get Stats"
api: "GET https://calendrian.vercel.app/api/stats"
description: "Retrieve attendee engagement statistics for a specific event."
---

### Headers

<ParamField header="x-access-key" type="string">
  Your Master Access Key for authentication.
</ParamField>

### Query Parameters

<ParamField query="eventId" type="string" required>
  The ID of the event to fetch statistics for.
</ParamField>

<ParamField query="refreshToken" type="string">
  The Google OAuth2 refresh token used to create the event.
</ParamField>

### Response

<ResponseField name="success" type="boolean">
  Indicates if the request was successful.
</ResponseField>

<ResponseField name="summary" type="string">
  The title of the event.
</ResponseField>

<ResponseField name="isScheduled" type="boolean">
  Whether the event is currently in the "Scheduled" queue.
</ResponseField>

<ResponseField name="stats" type="object">
  <Expandable title="properties">
    <ResponseField name="total" type="number">
      Total number of recipients.
    </ResponseField>
    <ResponseField name="accepted" type="object">
      <Expandable title="properties">
        <ResponseField name="count" type="number">Number of accepted invites.</ResponseField>
        <ResponseField name="emails" type="string[]">List of emails that accepted (visible to admins).</ResponseField>
      </Expandable>
    </ResponseField>
    <ResponseField name="tentative" type="object">
      <Expandable title="properties">
        <ResponseField name="count" type="number">Number of tentative responses.</ResponseField>
        <ResponseField name="emails" type="string[]">List of emails.</ResponseField>
      </Expandable>
    </ResponseField>
    <ResponseField name="declined" type="object">
      <Expandable title="properties">
        <ResponseField name="count" type="number">Number of declined invites.</ResponseField>
        <ResponseField name="emails" type="string[]">List of emails.</ResponseField>
      </Expandable>
    </ResponseField>
  </Expandable>
</ResponseField>

<RequestExample>

```bash
curl --request GET \
  --url 'https://calendrian.vercel.app/api/stats?eventId=e_123&refreshToken=rt_789' \
  --header 'x-access-key: master_key_123'
```

</RequestExample>
