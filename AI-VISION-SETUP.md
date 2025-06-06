# Weight Tracking Application with AI Image Analysis

This application allows users to track their weight by manually entering data or by uploading photos of their scale display. The AI image analysis feature uses OpenAI's GPT-4 Vision API to automatically detect the weight from scale images.

## Setting Up OpenAI Vision API Integration

To use the AI image analysis feature, you need to set up your OpenAI API key:

1. Sign up for an OpenAI account at [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Create an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Copy your API key
4. In the root directory of the project, add your API key to the `.env.local` file:
   ```
   OPENAI_API_KEY="your-openai-api-key-here"
   ```
5. Restart the development server if it's running

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
