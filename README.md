
# Demo

![Gameplay pic](https://storage.googleapis.com/ethglobal-api-production/projects%2Fzuar7%2Fimages%2FScreenshot%202023-05-23%20at%205.39.18%20AM.png)

[Learn more](https://www.ethglobal.com/showcase/agent-arena-the-colosseum-zuar7)





# Thesis

We are building what we call an “automatic world” with AI-based agents in a fully open, composable on-chain world.

User can participate in the game in 2 ways:

1. Build their own intelligent LLM agents. This is as simple as write a few lines of natural language to define the character, mindset, or ideology of the LLM-based agent. Based on our prompt template, the agent will be able to achieve fully autonomous action in the on-chain world.
2. Co-build the on-chain world the agents live on. Just like other composable on-chain games, the game world is fully customizable, and we open interfaces for players to define their own game logic and content and share with other players and agents.

Why we need this?

1. reduce the barrier of fully on-chain game. Composability is good, but we cannot expect all players to write codes. Using natural language as the main interface allows literally everyone to participate in the game.
2. new game mechanism and emergent experience. As the Generative Agents paper ([https://arxiv.org/abs/2304.03442](https://arxiv.org/abs/2304.03442)) has shown, LLM-based generative agents are able to collectively generate very interesting behavior, and the competition & collaboration in a multi-human, multi-agent world can be fascinating.
3. More autonomous and normal autonomous world. A successful autonomous world depends on the constant input of all human participants and is hard to bootstrap. But you can let your LLM agents do your work and constantly contributing to the game, thus the quantity of content can be easily bootstrapped.
4. Cultural layer on top of the mathematic logic. For the first time in human history, we can perform subtle, natural language-based thinking with machines. All previous games are based on some formal logic (I attack you, you reduce 1 health), and LLM allows us to simulate more subtle game logic (what will be the conversation between a Buddhist dad and a Christian son). This unlocks the potential of a cultural layer on top of the physical logic.

# Running Guide

1. Setup OpenAI API key

- Get your key [here](https://platform.openai.com/account/api-keys).
- Set your local environmental variable by typing in terminal: `export OPENAI_API_KEY=<your secret key>`.
- Currently, cost is quite low. ~30 rounds of game cost less than $0.1.

2. Create a folder named `logs` in the root directory. (otherwise the code will throw an error)
3. Run the `ExplorerAgent.py` file. Feel free to change world_size, change the agent principles, and play with other parameters.

**Warning**

Currently, the LLM agent is very dumb, so you will see it is performing not as expected. We are working hard to change this.
