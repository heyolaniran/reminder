---
title: "Envoyer un rappel"
api: "POST https://calendrian.vercel.app/api/send"
description: "Envoyer une invitation de calendrier à une liste de destinataires."
---

### Corps de la requête (Body)

<ParamField body="emails" type="string[]" required>
  Un tableau d'adresses e-mail auxquelles envoyer l'invitation.
</ParamField>

<ParamField body="eventDetails" type="object" required>
  <Expandable title="propriétés">
    <ParamField body="title" type="string" required>
      Le titre/résumé de l'événement de calendrier.
    </ParamField>
    <ParamField body="description" type="string" required>
      La description de l'événement. Supporte certaines balises HTML.
    </ParamField>
    <ParamField body="startDate" type="string" required>
      Chaîne ISO 8601 représentant la date et l'heure de début.
    </ParamField>
    <ParamField body="endDate" type="string" required>
      Chaîne ISO 8601 représentant la date et l'heure de fin.
    </ParamField>
    <ParamField body="location" type="string">
      Lieu physique ou URL de l'événement.
    </ParamField>
    <ParamField body="userTimezone" type="string">
      Le fuseau horaire de l'événement (ex: "Europe/Paris"). Par défaut "UTC".
    </ParamField>
    <ParamField body="scheduledAt" type="string">
      Chaîne ISO 8601. Si fournie, le rappel sera mis en file d'attente et envoyé à ce moment précis.
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="refreshToken" type="string">
  Le refresh token Google OAuth2 pour le compte envoyant les invitations. Si omis, le compte système par défaut est utilisé.
</ParamField>

<ParamField body="visitorToken" type="string" required>
  Un identifiant unique pour l'utilisateur ou la session.
</ParamField>

### Réponse

<ResponseField name="success" type="boolean">
  Indique si la requête a réussi.
</ResponseField>

<ResponseField name="eventId" type="string">
  L'ID unique de l'événement Google Calendar crée (retourné pour les envois immédiats).
</ResponseField>

<ResponseField name="link" type="string">
  Le lien HTML vers l'événement Google Calendar.
</ResponseField>

<ResponseField name="scheduled" type="boolean">
  Défini sur `true` si l'événement a été mis en file d'attente pour une diffusion future.
</ResponseField>

<RequestExample>

```bash
curl --request POST \
  --url https://calendrian.vercel.app/api/send \
  --header 'Content-Type: application/json' \
  --data '{
  "emails": ["user@example.com"],
  "eventDetails": {
    "title": "Bienvenue sur Calendrian",
    "description": "Heureux de vous avoir parmi nous !",
    "startDate": "2026-02-20T10:00:00Z",
    "endDate": "2026-02-20T11:00:00Z",
    "location": "En ligne",
    "userTimezone": "Europe/Paris"
  },
  "visitorToken": "v_123456"
}'
```

</RequestExample>
