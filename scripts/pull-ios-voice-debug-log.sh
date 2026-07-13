#!/usr/bin/env bash
set -euo pipefail

DEVICE_ID="${1:-3C508470-B239-50DC-9636-8564844ECBDD}"
BUNDLE_ID="${2:-com.netease.yunxin.app.im.zhiyun}"
OUTPUT_DIR="${3:-build/ios-voice-debug}"
LOG_SOURCE="Documents/chat-voice-debug.log"

mkdir -p "$OUTPUT_DIR"

xcrun devicectl device info files \
  --device "$DEVICE_ID" \
  --domain-type appDataContainer \
  --domain-identifier "$BUNDLE_ID" \
  --subdirectory Documents \
  --filter "name == 'chat-voice-debug.log'" || true

xcrun devicectl device copy from \
  --device "$DEVICE_ID" \
  --domain-type appDataContainer \
  --domain-identifier "$BUNDLE_ID" \
  --source "$LOG_SOURCE" \
  --destination "$OUTPUT_DIR/chat-voice-debug.log"

echo "$OUTPUT_DIR/chat-voice-debug.log"
