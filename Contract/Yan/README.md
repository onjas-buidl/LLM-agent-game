Factory Contract:
1. Game instance creation: Deploy a new gameplay contract and initialize it with the desired components.
* Some design choices: 1. Who gets to call creation function? Idealy not the players so they can't "frontrun" each other - assuming called from our server and we have an account paying the gas fee as well as later on relaying the generated decisions. 2. Say owner is our server address, what about winner gets the final game play?

2. Define the gaming components: Size of the grid, #participants, composable modules... Modules can be predefined and stored in the contract or provided by any player written contract.

3. Set up agents: Not sure if we want to keep principle(startegy) and prompts on-chain. My take is not - this game should be playable without prompts.

4. Storage and tracking: Keep track of all the game instances created by storing their addresses in a mapping. This will allow easy access to the game instances for future interactions, as well as multiple games happening at the same time.


Gameplay Contract:
1. Game state management: Define the necessary data structures and variables to manage the game state. This can include player scores, game progress, component interactions, and any other relevant information.

2. Interactions with components: Implement functions that allow players to interact with the gaming components. These functions should update the game state based on the actions taken by the players.

3. Game logic and rules: Define the rules and logic of the game within the contract. This can include win conditions, turn-based mechanics, and any other game-specific functionality.

4. Only owner can call the write functions


## deploy contract to local
```bash
yarn install
yarn dev-node
```

open another terminal
```bash
yarn deploy:local
```