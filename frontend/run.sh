#!/bin/bash

set -a
source .env
set +a

npm run dev -- --port $FRONTEND_PORT