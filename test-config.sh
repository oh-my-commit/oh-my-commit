#!/bin/bash

# Set test environment variables
export OHMYCOMMIT_BASIC_ENABLED=true
export OHMYCOMMIT_MODEL_ID=ohMyCommit.standard
export OHMYCOMMIT_UI_MODE=window
export OHMYCOMMIT_GIT_COMMIT_LANGUAGE=zh_CN
export OHMYCOMMIT_GIT_AUTO_STAGE=false
export OHMYCOMMIT_GIT_EMPTY_CHANGE_BEHAVIOR=amend

# Run omc with debug logging
DEBUG=* omc init
