FROM rabbitmq:3-management-alpine

ENV RABBITMQ_USER user
# Make sure to change this password by providing a new one in the docker-compose.yml file
ENV RABBITMQ_PASSWORD user

ENV RABBITMQ_PID_FILE /var/lib/rabbitmq/mnesia/rabbitmq

VOLUME /etc/rabbitmq/

# COPY config/rabbitmq.config /etc/rabbitmq/
COPY init.sh /init.sh

RUN chmod +x /init.sh

EXPOSE 5671 5672 15672

CMD ["/init.sh"]
