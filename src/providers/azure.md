# Azure OpenAI

Azure OpenAI Service provides enterprise-grade access to OpenAI's models through Microsoft's Azure cloud platform. It offers enhanced security, compliance, and reliability features for business applications.

## Overview

- **Provider Type**: Enterprise OpenAI service
- **Free Tier**: ❌ No free tier
- **Setup Complexity**: High (requires Azure account and resource setup)
- **Best For**: Enterprise applications, compliance requirements
- **Documentation**: [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)

## Supported Models

| Model Family | Model Name | Capabilities |
|--------------|------------|--------------|
| **GPT-4** | `gpt-4`, `gpt-4-32k` | Advanced reasoning, complex tasks |
| **GPT-4 Turbo** | `gpt-4-turbo`, `gpt-4-turbo-preview` | Latest GPT-4 with improved performance |
| **GPT-3.5** | `gpt-35-turbo`, `gpt-35-turbo-16k` | Fast, cost-effective text generation |
| **Embeddings** | `text-embedding-ada-002` | Text similarity and search |

## Prerequisites

### 1. Azure Account
- Active Azure subscription
- Sufficient credits or payment method configured
- Access to Azure OpenAI Service (may require application approval)

### 2. Request Access
Azure OpenAI Service requires approval for access:
1. Visit [Azure OpenAI Service Request Form](https://aka.ms/oai/access)
2. Fill out the application form
3. Wait for approval (can take several days)

## Setup Guide

### Step 1: Create Azure OpenAI Resource

1. **Sign in to Azure Portal**
   ```
   https://portal.azure.com
   ```

2. **Create New Resource**
   - Search for "OpenAI"
   - Select "Azure OpenAI"
   - Click "Create"

3. **Configure Resource**
   ```
   Subscription: Your Azure subscription
   Resource Group: Create new or select existing
   Region: Choose your preferred region
   Name: your-openai-resource-name
   Pricing Tier: Standard S0
   ```

4. **Review and Create**
   - Review your configuration
   - Click "Create"
   - Wait for deployment to complete

### Step 2: Deploy Models

1. **Access Azure OpenAI Studio**
   ```
   https://oai.azure.com
   ```

2. **Create Model Deployment**
   - Navigate to "Deployments"
   - Click "Create new deployment"
   - Select model (e.g., `gpt-4`)
   - Choose deployment name (e.g., `gpt-4-deployment`)
   - Set capacity and configuration
   - Click "Create"

### Step 3: Get API Configuration

1. **Find Your Endpoint**
   - Go to your Azure OpenAI resource in Azure Portal
   - Copy the "Endpoint" URL
   - Format: `https://your-resource.openai.azure.com`

2. **Get API Key**
   - In Azure Portal, go to "Keys and Endpoint"
   - Copy "Key 1" or "Key 2"

3. **Note Deployment Names**
   - In Azure OpenAI Studio, go to "Deployments"
   - Note the deployment names you created

## Configuration

### Basic Configuration

```javascript
// wrangler-config.js
const providerConfig = {
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment-name',
    api_keys: ['your-azure-api-key'],
  },
};

const modelProviderConfig = {
  'gpt-4': {
    providers: [
      {
        provider: 'azure',
        model: 'gpt-4', // This should match your deployment name
      },
    ],
  },
};
```

### Multiple Deployments

```javascript
const providerConfig = {
  // Primary Azure deployment
  azure_primary: {
    base_url: 'https://your-resource-us.openai.azure.com/openai/deployments/gpt-4-deployment',
    api_keys: ['your-azure-key-1'],
  },
  
  // Backup Azure deployment (different region)
  azure_backup: {
    base_url: 'https://your-resource-eu.openai.azure.com/openai/deployments/gpt-4-deployment',
    api_keys: ['your-azure-key-2'],
  },
};

const modelProviderConfig = {
  'gpt-4': {
    providers: [
      { provider: 'azure_primary', model: 'gpt-4' },
      { provider: 'azure_backup', model: 'gpt-4' },
    ],
  },
};
```

### Custom API Versions

```javascript
const providerConfig = {
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
    api_keys: ['your-azure-api-key'],
    headers: {
      'api-version': '2024-02-15-preview', // Specify API version
    },
  },
};
```

## URL Format Details

Azure OpenAI uses a specific URL format that differs from standard OpenAI:

### Standard Format
```
https://{resource-name}.openai.azure.com/openai/deployments/{deployment-name}/chat/completions?api-version={api-version}
```

### Configuration in Apex AI Proxy
```javascript
// The base_url should include everything up to the deployment name
base_url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment-name'

// The proxy will automatically append the correct paths and API version
```

## Model Deployment Names

### Naming Best Practices

1. **Use Descriptive Names**
   ```
   gpt-4-production
   gpt-35-turbo-dev
   text-embedding-ada-002-prod
   ```

2. **Environment Separation**
   ```
   gpt-4-prod        // Production
   gpt-4-staging     // Staging
   gpt-4-dev         // Development
   ```

3. **Regional Deployments**
   ```
   gpt-4-us-east     // US East region
   gpt-4-eu-west     // EU West region
   ```

## Rate Limits and Quotas

### Default Limits
- **GPT-4**: 20,000 tokens per minute
- **GPT-3.5**: 240,000 tokens per minute
- **Embeddings**: 240,000 tokens per minute

### Increasing Limits
1. Go to Azure OpenAI Studio
2. Navigate to "Quotas"
3. Request quota increases
4. Provide business justification

### Multiple Keys Strategy
```javascript
const providerConfig = {
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/gpt-4-deployment',
    api_keys: [
      'key-from-resource-1',
      'key-from-resource-2',  // Different Azure OpenAI resource
      'key-from-resource-3',  // Third resource for higher limits
    ],
  },
};
```

## Regional Deployment Strategy

### Multi-Region Setup for High Availability

```javascript
const providerConfig = {
  azure_us_east: {
    base_url: 'https://your-us-east.openai.azure.com/openai/deployments/gpt-4',
    api_keys: ['us-east-api-key'],
  },
  azure_eu_west: {
    base_url: 'https://your-eu-west.openai.azure.com/openai/deployments/gpt-4',
    api_keys: ['eu-west-api-key'],
  },
  azure_asia_southeast: {
    base_url: 'https://your-asia.openai.azure.com/openai/deployments/gpt-4',
    api_keys: ['asia-api-key'],
  },
};

const modelProviderConfig = {
  'gpt-4': {
    providers: [
      { provider: 'azure_us_east', model: 'gpt-4' },      // Primary
      { provider: 'azure_eu_west', model: 'gpt-4' },      // Backup
      { provider: 'azure_asia_southeast', model: 'gpt-4' }, // Tertiary
    ],
  },
};
```

## Security and Compliance

### Network Security
- Configure private endpoints
- Use virtual network integration
- Set up firewall rules

### Access Control
- Use Azure Active Directory authentication
- Implement role-based access control (RBAC)
- Configure managed identities

### Data Residency
- Choose appropriate Azure regions
- Understand data processing locations
- Configure data retention policies

## Monitoring and Analytics

### Azure Monitor Integration
```javascript
// Monitor your Azure OpenAI usage
const providerConfig = {
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/gpt-4',
    api_keys: ['your-key'],
    headers: {
      'X-Correlation-ID': 'your-correlation-id', // For request tracking
    },
  },
};
```

### Key Metrics to Monitor
- Token usage per model
- Request latency
- Error rates
- Cost per request

## Troubleshooting

### Common Issues

**❌ "Resource not found" error**
```
Solution: Check your base_url format and deployment name
Correct: https://resource.openai.azure.com/openai/deployments/deployment-name
```

**❌ "Invalid API key" error**
```
Solution: Verify your API key in Azure Portal under "Keys and Endpoint"
```

**❌ "Model not found" error**
```
Solution: Ensure the deployment exists and name matches exactly
```

**❌ "Rate limit exceeded" error**
```
Solution: 
1. Check quota usage in Azure OpenAI Studio
2. Request quota increase
3. Add multiple API keys from different resources
```

### Debug Configuration

```javascript
// Test your Azure configuration
const testConfig = {
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/gpt-35-turbo', // Use cheaper model for testing
    api_keys: ['your-azure-api-key'],
  },
};
```

## Cost Optimization

### Model Selection
- Use GPT-3.5 for simpler tasks
- Reserve GPT-4 for complex reasoning
- Optimize prompt length

### Regional Pricing
- Compare pricing across Azure regions
- Consider data transfer costs
- Use reserved capacity for predictable workloads

### Example Cost-Optimized Configuration
```javascript
const modelProviderConfig = {
  // Use GPT-3.5 for most tasks
  'gpt-3.5-turbo': {
    providers: [
      { provider: 'azure', model: 'gpt-35-turbo' },
    ],
  },
  
  // Reserve GPT-4 for complex tasks
  'gpt-4-complex': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },
    ],
  },
};
```

## Next Steps

- **[Configuration Guide](/guide/configuration)** - Advanced configuration options
- **[Load Balancing](/guide/load-balancing)** - Optimize performance across providers
- **[Monitoring](/guide/monitoring)** - Track usage and performance
- **[DeepSeek Provider](./deepseek)** - Add a cost-effective fallback option

## External Resources

- [Azure OpenAI Service Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure OpenAI Studio](https://oai.azure.com)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- [Request Access Form](https://aka.ms/oai/access)
