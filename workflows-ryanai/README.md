# OpenAI Agent - AI-Powered Workflow

A workflow that uses OpenAI's API to analyze text, extract key information, and generate summaries — demonstrating how to integrate external AI services into Render Workflows.

## What you'll learn

- Integrating external APIs (OpenAI) in workflow tasks
- Multi-step AI processing pipeline
- Environment variable configuration for API keys
- Retry handling for external service calls

## Workflow structure

```
analyzeText (orchestrator)
  ├── extractKeyInfo    (AI-powered extraction)
  ├── analyzeSentiment  (AI-powered analysis)
  └── generateSummary   (AI-powered summarization)
```

## Prerequisites

- An [OpenAI API key](https://platform.openai.com/api-keys)

## Setup

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## Run locally

```bash
npm install
npm run build
npm start
```

## Deploy to Render

Create a new **Workflow** service on Render:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variable:** `OPENAI_API_KEY` — your OpenAI API key
