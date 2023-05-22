import json
from os import getenv
from web3 import Web3, HTTPProvider
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from eth_account import Account
from AgentConfig import Agent

NODE_URL = getenv('NODE_URL')
PRIVATE_KEY = getenv('PRIVATE_KEY')


def load_abi_from_path(path):
    with open(path, 'r') as f:
        return f.read()


class Web3Game:
    def __init__(self, gameplay_contract_address, factory_contract_address, node_url=NODE_URL) -> None:
        if not gameplay_contract_address:
            raise Exception('gameplay_contract_address is required')

        if not factory_contract_address:
            raise Exception('factory_contract_address is required')

        account = Account.from_key(PRIVATE_KEY)
        web3 = Web3(HTTPProvider(node_url))
        web3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))

        self.gameplay_contract = web3.eth.contract(address=gameplay_contract_address,
                                                   abi=load_abi_from_path('./abis/gameplay.json'))
        self.factory_contract = web3.eth.contract(address=factory_contract_address,
                                                  abi=load_abi_from_path('./abis/factory.json'))

        self.agent_list = []

    # transfer ownership of the gameplay contract
    # onlyOwner
    # new_owner: address
    def set_owner(self, new_owner):
        tx = self.gameplay_contract.functions.setOwner(new_owner).transact()
        print(f"set_owner(): {tx.hex()}")
        return tx.hex()

    # map initialization
    # onlyOwner
    # size: uint256
    # numWealth: uint256
    def random_initialize_map(self, size, num_wealth):
        tx = self.gameplay_contract.functions.randomInitializeMap(size, num_wealth).transact()
        print(f"random_initialize_map(): {tx.hex()}")
        return tx.hex()

    # TODO: module system not implemented yet
    # def deploy_contracts(self, module_list):
    #     self.gameplay_contract.functions.deployContracts(module_list).transact()

    # add explorer
    # onlyOwner
    # name: string
    # x: uint256
    # y: uint256
    # stamina: uint256
    # wealth: uint256
    def add_explorer(self, name, x, y, stamina, wealth):
        tx = self.gameplay_contract.functions.addExplorer(name, x, y, stamina, wealth).transact()
        self.agent_list.append(Agent(name, "I am a bad person"))
        print(f"add_explorer(): {tx.hex()}")
        return tx.hex()

    # start game
    # size: uint256
    # numWealth: uint256
    # agentCount: uint256
    # agentList: Agent[]
    def start_game(self, size, num_wealth, agent_count, agent_list):
        tx = self.factory_contract.functions.startGame(size, num_wealth, agent_count, agent_list).transact()
        print(f"start_game(): {tx.hex()}")
        self._start_game()
        return tx.hex()

    def _start_game(self):
        for _ in range(10): #define max number of round
            agent_name_list = self.gameplay_contract.functions.getExplorer().call()
            for agent_name in agent_name_list:
                action = self.agent_list[agent_name].take_action()
                if 'move' in action:
                    _, direction = action.split(" ")
                    self.move(agent_name, direction)
                elif 'gather' in action:
                    self.gather_wealth(agent_name)
                elif 'rest' in action:
                    self.rest(agent_name)
                elif 'attack' in action:
                    _, t = action.split(" ")
                    target_name = self.get_explorer_name_by_direction(self_name=agent_name, self_pos=None, direction=t)
                    self.attack(agent_name, target_name)

    # move explorer
    # onlyOwner
    # name: string
    # direction: string(up | down | left | right)
    def move(self, name, direction):
        tx = self.gameplay_contract.functions.move(name, direction).transact()
        print(f"move(): {tx.hex()}")
        return tx.hex()

    # gather wealth
    # onlyOwner
    # name: string
    def gather_wealth(self, name):
        tx = self.gameplay_contract.functions.gatherWealth(name).transact()
        print(f"gather_wealth(): {tx.hex()}")
        return tx.hex()

    # rest
    # onlyOwner
    # name: string
    def rest(self, name):
        tx = self.gameplay_contract.functions.rest(name).transact()
        print(f"rest(): {tx.hex()}")
        return tx.hex()

    # attack
    # onlyOwner
    # attackerName: string
    # defenderName: string
    def attack(self, attacker_name, defender_name):
        tx = self.gameplay_contract.functions.attack(attacker_name, defender_name).transact()
        print(f"attack(): {tx.hex()}")
        return tx.hex()

    # get surroundings
    # name: string
    def get_surroundings(self, name):
        return self.gameplay_contract.functions.getSurroundings(name).call()

    # get allowed actions
    # name: string
    def get_allowed_actions(self, name):
        return self.gameplay_contract.functions.getAllowedActions(name).call()

    # get world state
    def get_world_state(self):
        return self.gameplay_contract.functions.getWorldState().call()

    # setLocation
    # name: string
    # x: uint256
    # y: uint256
    def set_location(self, name, x, y):
        tx = self.gameplay_contract.functions.setLocation(name, x, y).transact()
        print(f"set_location(): {tx.hex()}")
        return tx.hex()

    # set stamina
    # name: string
    # stamina: uint256
    def set_stamina(self, name, stamina):
        tx = self.gameplay_contract.functions.setStamina(name, stamina).transact()
        print(f"set_stamina(): {tx.hex()}")
        return tx.hex()

    # get agent
    # name: string
    def get_agent(self, name):
        return self.gameplay_contract.functions.getAgent(name).call()