#!/bin/bash
set -euo pipefail

KEY=~/.ssh/lmh_deploy
HOST=root@72.56.249.5
SSH="ssh -i $KEY -o ConnectTimeout=20 -o ServerAliveInterval=5 -o StrictHostKeyChecking=accept-new"
SCP="scp -i $KEY -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new"

echo "==> Packing source..."
cd ~/Desktop/lmh-store
tar czf /tmp/lmh-deploy.tar.gz \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  .

echo "==> Uploading to VPS..."
for i in 1 2 3 4 5; do
  $SCP /tmp/lmh-deploy.tar.gz $HOST:/tmp/lmh-deploy.tar.gz && break
  echo "scp retry $i..."; sleep 3
done

echo "==> Extracting + building on VPS (this takes a few minutes)..."
$SSH $HOST bash -s <<'REMOTE'
set -e
mkdir -p /opt/lmh
tar xzf /tmp/lmh-deploy.tar.gz -C /opt/lmh --exclude='./.env'
cd /opt/lmh
rm -f /tmp/build.log /tmp/build.done
nohup docker build -t lmh-store:latest . > /tmp/build.log 2>&1 && echo BUILD_OK > /tmp/build.done || echo BUILD_FAIL > /tmp/build.done &
BUILD_PID=$!
while [ ! -f /tmp/build.done ]; do sleep 5; done
cat /tmp/build.log | tail -n 40
STATUS=$(cat /tmp/build.done)
if [ "$STATUS" != "BUILD_OK" ]; then
  echo "BUILD FAILED"
  exit 1
fi
docker rm -f lmh || true
docker run -d --name lmh --restart unless-stopped --network host -e HOSTNAME=127.0.0.1 -e PORT=3000 --env-file /opt/lmh/.env lmh-store:latest
sleep 3
docker ps --format '{{.Names}} {{.Status}}'
curl -s -o /dev/null -w "local curl on VPS: %{http_code}\n" http://127.0.0.1:3000
REMOTE

echo "==> Verifying public site..."
curl -s --resolve xn--k1ac1a.com:443:72.56.249.5 -o /dev/null -w "https://лмх.com : %{http_code}\n" https://xn--k1ac1a.com

echo "==> Done."
