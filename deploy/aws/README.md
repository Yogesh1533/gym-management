# Deploying PY Fitness to AWS (free tier)

This deploys the whole app to **one small EC2 server**, which keeps it inside the AWS free tier:

| Piece | What runs it | Why it costs nothing |
|---|---|---|
| Website + API | Node/Express on one `t3.micro` EC2 instance | Free-tier eligible instance type |
| Database | SQLite file on the instance's disk | No RDS, no extra service |
| HTTPS | Caddy + a free Let's Encrypt certificate for `<your-ip>.sslip.io` | No domain, load balancer or certificate to pay for |
| Disk | 10 GB gp3 (encrypted) | Free tier covers 30 GB |
| Cost alarm | AWS Budget that emails you when spend goes over **$0.01** | The first 2 budgets are free |

The instance uses `CPUCredits: standard`. With the AWS default (`unlimited`), heavy CPU use on a t3 instance is billed as extra credits. With `standard`, the CPU slows down instead.

## 1. Make sure your account really is free

Which rules apply depends on when you created your AWS account:

- **Created on or after 15 July 2025.** Pick the **Free plan** when you sign up. On the Free plan AWS *cannot* charge your card. Usage is paid from your free credits ($100 at sign-up, up to $200 total). This server uses roughly $12 of credit a month, so the credits outlast the plan's 6 months. When the plan ends you're asked whether to upgrade. Nothing is billed unless you choose to upgrade.
- **Created before 15 July 2025, less than 12 months ago.** The legacy free tier covers 750 hours a month of `t3.micro`/`t2.micro`, 30 GB of EBS and 750 hours of public IPv4. That's enough for one server running all month for $0.
- **Created before 15 July 2025, more than 12 months ago.** Your free tier has expired, so this setup **will cost about $12 a month**. Don't deploy it, or run `./teardown.sh` as soon as you're done demoing.

You can check under **Billing → Free tier** in the AWS console.

Rules that keep your bill at $0:
- Run **only one** of these stacks. The free hours are shared across all your instances.
- Don't change the instance type to anything other than `t3.micro` or `t2.micro`.
- Confirm the "AWS Notification – Subscription Confirmation" email so budget alerts reach you.
- Run `./teardown.sh` when you no longer need the site.

## 2. Deploy

You need the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), configured with `aws configure` (an IAM user or SSO login that has admin rights).

```bash
cd deploy/aws
./deploy.sh you@example.com ap-southeast-2    # your email, then the region closest to you
```

It takes about 10 minutes, because the server installs Node, builds the React app and starts everything. When it finishes it prints:

- **WebsiteUrl**, e.g. `https://3-25-1-2.sslip.io`. This is your site. The HTTPS certificate is issued on the first visit, so allow up to a minute.
- **PlainHttpUrl**, e.g. `http://3.25.1.2`. A fallback in case HTTPS isn't ready yet.

Log in with the demo accounts from the main README (`admin@gym.com` / `admin123`).

By default the demo data is restored every 24 hours, so visitors can't permanently break the public demo. For real use, turn that off:

```bash
aws cloudformation deploy --stack-name py-fitness --template-file template.yaml \
  --capabilities CAPABILITY_IAM --use-previous-parameters --parameter-overrides DemoResetHours=0
```

(Parameter changes replace the instance, and the SQLite data is replaced with it.)

## 3. Update the site after pushing new code

```bash
aws ssm start-session --target <InstanceId> --region <region>   # command is in the stack outputs
sudo -u gym bash -c 'cd /opt/gym/app && git pull && cd backend && npm ci --omit=dev && cd ../frontend && npm ci && INLINE_RUNTIME_CHUNK=false npm run build'
sudo systemctl restart py-fitness
```

Logs: `sudo journalctl -u py-fitness -f`. First-boot setup log: `/var/log/py-fitness-setup.log`.

## 4. Remove everything

```bash
./teardown.sh ap-southeast-2
```

This deletes the instance, disk, security group, IAM role and budget. Nothing is left behind that could cost money.
