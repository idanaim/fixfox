# GitHub Secrets Setup for FixFox

This guide explains how to set up GitHub Secrets for automatic deployment of the FixFox application.

## 🔐 Required Secrets

Navigate to your repository settings: `https://github.com/idanaim/fixfox/settings/secrets/actions`

### AWS Credentials (Required)
These are needed for GitHub Actions to deploy to your AWS account:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### Application Secrets (Required)
| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Get from [OpenAI Dashboard](https://platform.openai.com/api-keys) |
| `JWT_SECRET` | Secret for JWT token signing | Run: `openssl rand -base64 32` |

### Database Credentials (Optional)
If you want to override the default database settings:

| Secret Name | Description | Default Value |
|-------------|-------------|---------------|
| `DATABASE_HOST` | RDS endpoint | `fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_USER` | Database username | `idanaim` |
| `DATABASE_PASSWORD` | Database password | `In16051982` |
| `DATABASE_NAME` | Database name | `fixfoxdb` |

## 🚀 How to Add Secrets

1. Go to your repository: https://github.com/idanaim/fixfox
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

## 🔄 Automatic Deployment

Once secrets are configured, deployment happens automatically when you:

- Push to `main` branch
- Push to `replace-aws-tier` branch
- Manually trigger the workflow from GitHub Actions tab

## 🧪 Manual Deployment

You can also trigger deployment manually:

1. Go to the **Actions** tab in your repository
2. Select **Deploy FixFox to AWS EC2**
3. Click **Run workflow**
4. Choose your branch and click **Run workflow**

## 📋 Deployment Process

The GitHub Action will:

1. ✅ Check out your code
2. ✅ Configure AWS credentials
3. ✅ Build and push Docker image to ECR
4. ✅ Deploy to EC2 instance
5. ✅ Run health checks
6. ✅ Report deployment status

## 🔍 Monitoring

After deployment, you can:

- Check the **Actions** tab for deployment logs
- SSH into your EC2 instance: `ssh -i ~/.ssh/fixfox-ec2-key-dev.pem ec2-user@<PUBLIC_IP>`
- View application logs: `docker-compose logs -f`

## 🆘 Troubleshooting

### Common Issues:

1. **AWS Credentials Invalid**: Verify your AWS Access Key and Secret Key
2. **OpenAI API Key Invalid**: Check your OpenAI API key is correct and has credits
3. **Database Connection Failed**: Verify RDS security group allows EC2 access
4. **Docker Build Failed**: Check Dockerfile and dependencies

### Getting Help:

1. Check the GitHub Actions logs for detailed error messages
2. SSH into EC2 and check Docker logs: `docker-compose logs`
3. Verify all secrets are properly set in GitHub

## 🔒 Security Best Practices

- ✅ Never commit secrets to your repository
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Regularly rotate your API keys and passwords
- ✅ Use least-privilege AWS IAM policies
- ✅ Monitor AWS CloudTrail for access logs 