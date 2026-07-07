#!/usr/bin/env bash
set -euo pipefail

EXPL="../vmblu.dev/docs/public/examples"
mkdir -p $EXPL

# copy the chat application
SOURCE="./chat-application"
DEST=$EXPL/chat-application
mkdir -p $DEST/chat-client/model $DEST/chat-server/model
cp $SOURCE/chat-client/chat-client.blu $DEST/chat-client/
cp $SOURCE/chat-client/model/chat-client{.mod.blu,.mod.viz,.src.prf} $DEST/chat-client/model/
cp $SOURCE/chat-server/chat-server.blu $DEST/chat-server/
cp $SOURCE/chat-server/model/chat-server{.mod.blu,.mod.viz,.src.prf} $DEST/chat-server/model/

# copy the solar system application + bundle
SOURCE="./solar-system"
DEST=$EXPL/solar-system
mkdir -p $DEST/model $DEST/assets
cp $SOURCE/solar-system.blu $DEST/
cp $SOURCE/model/solar-system{.mod.blu,.mod.viz,.src.prf} $DEST/model/
cp $SOURCE/out/solar-system.app-bundle.js $DEST/
cp $SOURCE/out/website-index.html $DEST/index.html
cp $SOURCE/out/assets/*.* $DEST/assets/

# copy the patient ledger
SOURCE="./patient-ledger"
DEST=$EXPL/patient-ledger
mkdir -p $DEST/server/model $DEST/client/model $DEST/admin/model
cp $SOURCE/server/server.blu $DEST/server/
cp $SOURCE/server/model/server{.mod.blu,.mod.viz,.src.prf} $DEST/server/model/
cp $SOURCE/client/client.blu $DEST/client/
cp $SOURCE/client/model/client{.mod.blu,.mod.viz,.src.prf} $DEST/client/model/
cp $SOURCE/admin/admin.blu $DEST/admin/
cp $SOURCE/admin/model/admin{.mod.blu,.mod.viz,.src.prf} $DEST/admin/model/