# Weight Tracking Application with AI Image Analysis

This application allows users to track their weight by manually entering data or by uploading photos of their scale display. The AI image analysis feature supports two options:

1. **OpenAI's GPT-4 Vision API** - Cloud-based solution (requires API key)
2. **Local Ollama with llava:7b** - Self-hosted solution (free, runs locally)

## AI Provider Options

### Option 1: Setting Up OpenAI Vision API Integration

To use the OpenAI Vision API for image analysis:

1. Sign up for an OpenAI account at [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Create an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Copy your API key
4. In the application, navigate to the Settings page
5. Select "OpenAI" as your AI provider
6. Paste your API key in the "OpenAI API Key" field and save your settings

### Option 2: Setting Up Ollama (Local AI) Integration

To use the local Ollama instance with llava:7b model:

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Start the Ollama service: `ollama serve`
3. Pull the llava model: `ollama pull llava:7b`
4. In the application, navigate to the Settings page
5. Select "Local Ollama" as your AI provider and save your settings

The Ollama API is expected to be available at `http://localhost:11434`.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Important Notes

### OpenAI Option:
- The OpenAI Vision API is a paid service. Check OpenAI's pricing page for current rates.
- The application includes rate limiting to prevent excessive API usage.

### Ollama Option:
- Completely free and runs locally (no internet connection needed after model download)
- Requires approximately 8GB of RAM for the llava:7b model
- First-time processing of images may be slower than OpenAI
- Image analysis quality may vary compared to OpenAI's models

## Error Handling

### OpenAI Common Error Codes:
- `insufficient_quota`: Your OpenAI account has reached its quota limit or billing threshold.
- `rate_limit_exceeded`: Too many requests in a short period of time.
- `invalid_api_key`: The API key provided is not valid or has been revoked.
- `invalid_request_error`: The image format is invalid or too large.
- `model_not_found`: Your account doesn't have access to the required model.

### Ollama Troubleshooting:
- If Ollama is not responding, verify the service is running with `ollama serve`
- Confirm the llava:7b model is installed with `ollama list`
- Check that the Ollama API is accessible at http://localhost:11434
- For models other than llava:7b, edit the model name in src/lib/ollama.ts

Each error comes with helpful information on how to resolve the issue.
