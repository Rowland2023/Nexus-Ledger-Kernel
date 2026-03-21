// /shared-kernel/infrastructure/messageBroker.js
import * as kafkaClient from './messaging/kafka.client.js';
import * as subscriber from './messaging/subscriber.js';

export const messageBroker = {
  ...kafkaClient,
  ...subscriber,
};
