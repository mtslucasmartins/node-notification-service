# About

Brand new Notifications Service, this service is intended to be the default notification service for Ottimizza. This project can be further incremented to be able to schedule notifications, or to send Firebase notifications to channels containing multiple clients/users. The whole project structure, important considerations, and sample requests can be found down below in this README. <br>

This project depends on some aditional resources, that being `Heroku Kafka`, `Heroku Redis` and `Heroku PostgreSQL`.<br>

---

# The devil is in the details...

When developing this project, I faced a few problems with Heroku's Kafka not being able to create dynamic Consumer Groups at runtime. So a logic for managing active instances and consumer groups was needed. The solution found was to have consumer groups previously created on Heroku's Kafka. When a new application instance is created, this instance goes to the redis and it register itself, assing a `consumer group` to it, and starts healthchecking every X seconds. If an instance stops healthchecking there's another worker that will automatically remove unhealthy instances, when an instance gets removed that `consumer group` is also released to be used by another instance in the future. 

---

# Notifications

## Firebase Notifications

This project, as the previous version written in Python, have support for Google's Firebase (FCM) Notifications. The request payload was kept the same for compatibility, the request iterates over all registrations saved in database for the specified client/user. This request was improved to be able to automatically unsubscribe clients/users that aren't active anymore. When a registration expires, Google replies with an Unregistered Error, so when we receive that error, we delete that specific registration id for that client/user (other registrations for that same client/user are kept).

### Sample Firebase Notification Request

```bash
  curl -X POST 'https://<domain_name>/api/v1/notifications/fcm'
    -H 'Content-Type: application/json'
    -d '{"applicationId":"<application_id>","username":"<username>","notification":{},"groupId":"<group_id>"}'
```

## WebSocket Notification

This project also have support for WebSocket Messaging/Notifications. All we need is the destination client(s) to be connected via websocket. Current implementation supports sending the notification to either a user or a channel. If we want to deliver a message to a specific client/user we can specify the `username` for that client/user. If we want the notification delivered to multiple clients, the best way is to subscribe all of them to a `channel` and send the notification to this `channel`. 

### Sample WebSocket Notification Request

```bash
  curl -X POST 'https://<domain_name>/api/v1/notifications/ws'
    -H 'Content-Type: application/json'
    -d '{"channel":"<channel>","username":"<username>","notification":{}}'
```

> **Note 1**: The current implementation does not require any authentication, but it will be worked on in the future. <br>
> **Note 2**: `channel` and `username` are optional, but at least one of them should be given.

---

## Resources

* Kafka, 
* Redis, 
* PostgreSQL.

---

# Package Structure

## `base`

in this package we keep basic implementations, connection factories, anything that might add unecessary complexity to component, or can be isolated to improve code legilibility. Here we current have a controller abstract implementation and connection factories for `kafka`, `psql` and `redis`.

## `commons`

Package containing objects, clients, utilities that can be shared among multiple services, repositories, workers. etc.
  
  * **[Client] Firebase Client:**<br>
    Client for sending notification to the Google's Firebase API (FCM).

## `controllers`

Package containing all applications's controllers. As in a SpringBoot project we keep all APIs. Current controllers are:
  
  * **[Core] Consumer Controller:**<br>
    API for consulting consumer information.

  * **[Notifications] Websocket Notification Controller:**<br>
    API for WebSocket notifications.

  * **[Notications] Firebase Notification Controller:**<br>
    API for Firebase (FCM) notifications.

## `repositories`

Package containing all application's repositories. Here, as in a SpringBoot project we keep all the logic for querying database. Current repositories are:

  * **[Core] Consumer Repository:**<br>
    Redis repository where we keep active Kafka Consumer Groups.

  * **[Core] Instance Repository:**<br>
    Redis repository where we keep active/health instances.

  * **[Notications] Firebase Repository:**<br>
    PostgreSQL repository where we keep firebase informations like firebase applications, server keys, registration ids and their respective user information.

  * **[WebSocket] Connection Repository:**<br>
    In Memory repository, here we keep the active websocket connections.

## `resources`

Nothing important here yet.

## `services`

Package containing all application's services. Here, as in SpringBoot projects we keep all business validations and logic. This should be where we look for, when we want to change a business rule. Current services are:

  * **[Core] Consumer Service:**<br>
    A service intended for managing active consumers accross application instances. This one was created because Heroku's Kafka does not allow us to create dynamic consumer groups. 

  * **[Core] Instance Service:**<br>
    A service responsible for managing active/healthy instances. Mainly used by **InstanceHealthcheck & InstancePruner Workers**

  * **[Messaging] WebSocket Messaging Service:**<br>
    This one is intended to be a bridge between the WebSocket Notification Service and the WebSocket server. It knows how to send the retrieved messages from queue to the destination user/channel.

  * **[Notifications] Firebase Notifications Service:**<br>
    Service responsible for sending notification via Firebase (FCM). (**Note:** It also deletes invalid registrations).

  * **[Notifications] WebSocket Notifications Service:**<br>
    This service is resposible to be an intermediate between WebSocket workers, consumers, producers and the MessagingService.


## `streams`

Package containig all application's **Consumers** and **Producers**. Basically, all that's related to Kafka or Queues, in general, should be added here for convention. Current consumers/producers are:

  * **[WebSocket] WebSocket Notifications Consumer:**<br>
    Consumer responsible for retrieving messages from a Kafka Queue. This one is used by **WebSocket Notifications Worker**.

  * **[WebSocket] WebSocket Notifications Producer:**<br>
    Producer responsible for publishing messages to a Kafka Queue. So when we want a notification sent via WebSocket we must send it to this Producer.


## `workers`

Package containing all application workers and a manager from them. Each new worker job shoud be added here for convention. Current workers are:

  * **[Core] Instance Healthcheck:**<br>
    Worker responsible for maintainig the application alive, basically, it updates a key containing all active instances.

  * **[Core] Instance Pruner:**<br>
    Worker responsible for cleaning unhealthy applications, when an application stops healthchecking for more then X seconds, it then removes it from the active instances 

  * **[WebSocket] WebSocket Notifications:**<br>
    Worker responsible for retrieving messages from a Kafka notifications queue, and sending it to specified user/channel via websocket.

# TODO

[] [Security] Add OAuth2 Authentication 

[] [Security] Add WebSocket Authentication - code exchange authentication for websocket connections

[] [Security] [Redis] storage for websocket authentication codes.

