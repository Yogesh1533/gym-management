#!/usr/bin/env bash
# Deletes everything deploy.sh created (instance, disk, security group, IAM role, budget).
set -euo pipefail
REGION="${1:-${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}}"
STACK="${STACK_NAME:-py-fitness}"
aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK"
echo "Deleting stack $STACK in $REGION..."
aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK"
echo "All resources deleted."
