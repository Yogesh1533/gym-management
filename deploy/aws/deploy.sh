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
# A stack whose creation failed can't be updated; delete it first
STATUS=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
  --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo NONE)
if [ "$STATUS" = "ROLLBACK_COMPLETE" ] || [ "$STATUS" = "CREATE_FAILED" ]; then
  echo "Removing the failed stack from the previous attempt..."
  aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK"
  aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK"
fi

echo "Creating stack (takes ~10 minutes while the server installs and builds the app)..."

# --disable-rollback keeps the server if setup fails, so its log can be read below
aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK" \
  --template-file "$HERE/template.yaml" \
  --capabilities CAPABILITY_IAM \
  --disable-rollback \
  --parameter-overrides "AlertEmail=$EMAIL" "GitBranch=$BRANCH" || {
    echo
    echo "Deployment failed. AWS reported:"
    aws cloudformation describe-stack-events --region "$REGION" --stack-name "$STACK" \
      --query "StackEvents[?contains(ResourceStatus,'FAILED')].[LogicalResourceId,ResourceStatusReason]" --output text | head -5 || true
    INSTANCE=$(aws cloudformation describe-stack-resource --region "$REGION" --stack-name "$STACK" \
      --logical-resource-id AppInstance --query "StackResourceDetail.PhysicalResourceId" --output text 2>/dev/null || true)
    if [ -n "$INSTANCE" ] && [ "$INSTANCE" != "None" ]; then
      echo
      echo "Last lines of the server's setup log ($INSTANCE):"
      echo "------------------------------------------------------------"
      aws ec2 get-console-output --region "$REGION" --instance-id "$INSTANCE" --latest \
        --query Output --output text 2>/dev/null | grep -v '^\[ *[0-9.]*\]' | tail -40 || true
      echo "------------------------------------------------------------"
    fi
    echo
    echo "Paste the output above to get it fixed. Then run ./teardown.sh $REGION (or re-run ./deploy.sh) to clean up."
    exit 1
  }

aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
  --query "Stacks[0].Outputs[].[OutputKey,OutputValue]" --output table

echo
echo "Done. Check $EMAIL and confirm the AWS Budgets notification subscription."
echo "When you no longer need the site, run: ./teardown.sh $REGION"
