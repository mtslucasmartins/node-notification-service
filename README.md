# Notification Service 2.0

## Notifications

### Firebase Notifications

```bash
  curl -X POST 'https://<domain_name>/api/v1/notifications/fcm'
    -H 'Content-Type: application/json'
    -d '{"applicationId":"<application_id>","username":"<username>","notification":{},"groupId":"<group_id>"}'
```

### WebSocket Notifications

```bash
  curl -X POST 'https://<domain_name>/api/v1/notifications/ws'
    -H 'Content-Type: application/json'
    -d '{"channel":"<channel>","username":"<username>","notification":{}}'
```

> Note: `channel` and `username` are optional, but at least one of them should be given.

---

## Instances & Consumers

---

## Workers

### Instance Pruner

### Instance Healthcheck

--- 

## Resources

* Kafka, 
* Redis, 
* PostgreSQL.

--- 

# user based  

ws.ottimizza.com.br/subscribe?token=<...>

--- 

# channel based 

ws.ottimizza.com.br/subscribe?channel=bussola-general-notifications&token=<...>

## TODO

[] Switch from CommonJS to ES6

[] Add logging 

  [] add winston logging for being able to send it to a loggin tool

[] OAuth2 Authentication 

[] WebSocket Authentication

  [] code exchange authentication for websocket 

  [] storage for codes

[] 

