import os
import concurrent.futures

import time
from langchain.chat_models import ChatOpenAI

class PipedLLM:
    def __init__(self, api_keys, chat_model='GPT3.5'):
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=len(api_keys))
        self.api_keys = api_keys
        self.used = {key: False for key in api_keys}

        self.chat_models = {}

        for key in api_keys:
            if chat_model == 'GPT3.5':
                self.chat_models[key] = ChatOpenAI(
                    temperature=0, openai_api_key=key, max_tokens=1500, request_timeout=360)
            elif chat_model == 'GPT4':
                self.chat_models[key] = ChatOpenAI(
                    temperature=0, openai_api_key=key, max_tokens=1500, request_timeout=360,
                    model_name="gpt-4")
            elif chat_model == 'Claude':
                from langchain.chat_models import ChatAnthropic
                from langchain.prompts.chat import (
                    ChatPromptTemplate,
                    SystemMessagePromptTemplate,
                    AIMessagePromptTemplate,
                    HumanMessagePromptTemplate,
                )
                from langchain.schema import (
                    AIMessage,
                    HumanMessage,
                    SystemMessage
                )
                self.chat_models[key] = ChatAnthropic(temperature=0, anthropic_api_key=key)
            else:
                raise NotImplementedError(
                    f"Chat model {chat_model} not implemented.")

    def get_unused_key(self):
        while True:
            for key, used in self.used.items():
                if not used:
                    self.used[key] = True
                    return key
            time.sleep(0.1)

    def release_key(self, key):
        self.used[key] = False

    def put(self, message):
        key = self.get_unused_key()
        future = self.executor.submit(self.request, message, key)
        return future

    def request(self, message, key):
        result = self.chat_models[key](message)
        self.release_key(key)
        return result