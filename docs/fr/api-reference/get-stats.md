---
title: "Obtenir des stats"
api: "GET https://calendrian.vercel.app/api/stats"
description: "Récupérer les statistiques d'engagement des participants pour un événement spécifique."
---

### En-têtes (Headers)

<ParamField header="x-access-key" type="string">
  Votre Clé d'Accès Maître pour l'authentification.
</ParamField>

### Paramètres de requête

<ParamField query="eventId" type="string" required>
  L'ID de l'événement pour lequel récupérer les statistiques.
</ParamField>

<ParamField query="refreshToken" type="string">
  Le refresh token Google OAuth2 utilisé pour créer l'événement.
</ParamField>

### Réponse

<ResponseField name="success" type="boolean">
  Indique si la requête a réussi.
</ResponseField>

<ResponseField name="summary" type="string">
  Le titre de l'événement.
</ResponseField>

<ResponseField name="isScheduled" type="boolean">
  Indique si l'événement est actuellement dans la file d'attente "Planifié".
</ResponseField>

<ResponseField name="stats" type="object">
  <Expandable title="propriétés">
    <ResponseField name="total" type="number">
      Nombre total de destinataires.
    </ResponseField>
    <ResponseField name="accepted" type="object">
      <Expandable title="propriétés">
        <ResponseField name="count" type="number">Nombre d'invitations acceptées.</ResponseField>
        <ResponseField name="emails" type="string[]">Liste des e-mails ayant accepté (visible pour les admins).</ResponseField>
      </Expandable>
    </ResponseField>
    <ResponseField name="tentative" type="object">
      <Expandable title="propriétés">
        <ResponseField name="count" type="number">Nombre de réponses incertaines.</ResponseField>
        <ResponseField name="emails" type="string[]">Liste des e-mails.</ResponseField>
      </Expandable>
    </ResponseField>
    <ResponseField name="declined" type="object">
      <Expandable title="propriétés">
        <ResponseField name="count" type="number">Nombre d'invitations déclinées.</ResponseField>
        <ResponseField name="emails" type="string[]">Liste des e-mails.</ResponseField>
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
