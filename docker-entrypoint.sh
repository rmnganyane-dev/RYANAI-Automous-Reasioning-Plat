#!/bin/sh
set -eu

if [ "${1:-}" = "nginx" ]; then
    : "${PORT:=80}"
    : "${API_HOST:=api}"
    : "${API_PORT:=3000}"

    for value in "$PORT" "$API_PORT"; do
        case "$value" in
            ''|*[!0-9]*) echo "PORT and API_PORT must be integers from 1 to 65535" >&2; exit 1 ;;
        esac
        if [ "$value" -lt 1 ] || [ "$value" -gt 65535 ]; then
            echo "PORT and API_PORT must be integers from 1 to 65535" >&2
            exit 1
        fi
    done
    case "$API_HOST" in
        ''|*[!a-zA-Z0-9._-]*) echo "API_HOST must be a hostname or IPv4 address" >&2; exit 1 ;;
    esac

    export PORT API_HOST API_PORT
    # Substitute only our settings; preserve Nginx variables such as $uri.
    envsubst '${PORT} ${API_HOST} ${API_PORT}' \
        < /etc/nginx/conf.d/default.conf.template \
        > /etc/nginx/conf.d/default.conf
    nginx -t
fi

exec "$@"
