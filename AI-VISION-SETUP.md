# Weight Tracking Application with AI Image Analysis

This application allows users to track their weight by manually entering data or by uploading photos of their scale display. The AI image analysis feature uses OpenAI's GPT-4 Vision API to automatically detect the weight from scale images.

## Setting Up OpenAI Vision API Integration

To use the AI image analysis feature, each user needs to set up their own OpenAI API key:

1. Sign up for an OpenAI account at [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Create an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Copy your API key
4. In the application, navigate to the Settings page
5. Paste your API key in the "OpenAI API Key" field and save your settings

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Important Notes

- The OpenAI Vision API is a paid service. Check OpenAI's pricing page for current rates.
- The application includes rate limiting to prevent excessive API usage.
- For testing purposes, you can use sample scale images.

## Error Handling

The application provides detailed error messages when OpenAI API requests fail:

### Common Error Codes

- `insufficient_quota`: Your OpenAI account has reached its quota limit or billing threshold.
- `rate_limit_exceeded`: Too many requests in a short period of time.
- `invalid_api_key`: The API key provided is not valid or has been revoked.
- `invalid_request_error`: The image format is invalid or too large.
- `model_not_found`: Your account doesn't have access to the required model.

Each error comes with helpful information on how to resolve the issue.
