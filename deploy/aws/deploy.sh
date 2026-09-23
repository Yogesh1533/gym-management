#!/usr/bin/env bash
# Deploys PY Fitness to a single free-tier EC2 instance with CloudFormation.
# Usage: ./deploy.sh you@example.com [region] [branch]
set -euo pipefail

EMAIL="${1:?Usage: ./deploy.sh <alert-email> [region] [branch]}"
REGION="${2:-${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}}"
BRANCH="${3:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"
STACK="${STACK_NAME:-py-fitness}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "Account: $(aws sts get-caller-identity --query Account --output text)"
echo "Region:  $REGION   Branch: $BRANCH   Stack: $STACK"
echo "Creating stack (takes ~10 minutes while the server installs and builds the app)..."

aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK" \
  --template-file "$HERE/template.yaml" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "AlertEmail=$EMAIL" "GitBranch=$BRANCH"

aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
  --query "Stacks[0].Outputs[].[OutputKey,OutputValue]" --output table

echo
echo "Done. Check $EMAIL and confirm the AWS Budgets notification subscription."
echo "When you no longer need the site, run: ./teardown.sh $REGION"
