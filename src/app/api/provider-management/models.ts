import { deepseek } from "@ai-sdk/deepseek";
import { openai as originalOpenAI } from "@ai-sdk/openai";
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";

const customOpenAI = customProvider({
  languageModels: {
    fast: originalOpenAI("gpt-5-nano"),
    smart: originalOpenAI("gpt-5-mini"),
    reasoning: wrapLanguageModel({
      model: originalOpenAI("gpt-5-mini"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "high",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalOpenAI,
});

const customDeepseek = customProvider({
  languageModels: {
    fast: deepseek("deepseek-chat"),
    smart: deepseek("deepseek-reasoner"),
  },
  fallbackProvider: deepseek,
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
  deepseek: customDeepseek,
});
