#!/bin/sh

# Create Rabbitmq user - https://stackoverflow.com/a/30773882/11086876
( rabbitmqctl wait --timeout 60 $RABBITMQ_PID_FILE ; \
rabbitmqctl add_user $RABBITMQ_USER $RABBITMQ_PASSWORD 2>/dev/null ; \
rabbitmqctl set_user_tags $RABBITMQ_USER administrator ; \
rabbitmqctl set_permissions -p / $RABBITMQ_USER  ".*" ".*" ".*" ; \

echo "*** User '$RABBITMQ_USER' with password '$RABBITMQ_PASSWORD' completed. ***" ; \
echo "*** Log in the WebUI at port 15672 (example: http:/localhost:15672) ***") &

# SSL
# chmod 0600 /etc/rabbitmq/certs/server.key
# chown rabbitmq:rabbitmq /etc/rabbitmq/certs/server.key /etc/rabbitmq/certs/server.crt

rabbitmq-server $@