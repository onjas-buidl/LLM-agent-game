import json
import os
from web3 import Web3, HTTPProvider
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from eth_account import Account
from AgentConfig import Agent


NODE_URL = os.environ.get('NODE_URL')
PRIVATE_KEY = os.environ.get('PRIVATE_KEY')

def load_abi_from_path(path):
    with open(path, 'r') as f:
        return f.read()

class Web3Game:
    def __init__(self, factory_contract_address, node_url=NODE_URL) -> None:
        if not factory_contract_address:
            raise Exception('factory_contract_address is required')

        self.account = Account.from_key(PRIVATE_KEY)
        self.web3 = Web3(HTTPProvider(node_url))
        self.web3.middleware_onion.add(construct_sign_and_send_raw_middleware(self.account))

        self.factory_contract = self.web3.eth.contract(address=factory_contract_address,
                                                  abi=load_abi_from_path('./abis/Factory.json'))

        self.agent_list = {}

    # transfer ownership of the gameplay contract
    # onlyOwner
    # new_owner: address
    def set_owner(self, new_owner):
        tx = self.gameplay_contract.functions.setOwner(new_owner).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        print(f"set_owner(): {tx.hex()}")
        return tx.hex()

    # map initialization
    # onlyOwner
    # size: uint256
    # numWealth: uint256
    def random_initialize_map(self, size, num_wealth):
        tx = self.gameplay_contract.functions.randomInitializeMap(size, num_wealth).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        print(f"random_initialize_map(): {tx.hex()}")
        return tx.hex()

    # TODO: module system not implemented yet
    # def deploy_contracts(self, module_list):
    #     self.gameplay_contract.functions.deployContracts(module_list).transact()

    # add explorer
    # onlyOwner
    # agent_id: uint256
    # x: uint256
    # y: uint256
    # stamina: uint256
    # wealth: uint256
    def add_explorer(self, agent_id, agent_name, x, y, stamina, wealth, principles):
        tx = self.gameplay_contract.functions.addExplorer(agent_id, agent_name, x, y, stamina, wealth).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        self.agent_list[agent_id] = Agent(id=agent_id, name=agent_name, principles=principles)
        print(f"add_explorer(): {tx.hex()}")
        return tx.hex()

    # start game
    # size: uint256
    # numWealth: uint256
    # agentCount: uint256
    # agentList: Agent[]
    # struct Agent {
    # uint256 id;    
    # string name;
    # uint256 x;
    # uint256 y;
    # uint256 stamina;
    # uint256 wealth;
    # }
    def start_game(self, size, num_wealth, agent_count, agent_list):
        _agent_list = [[a['id'],a['name'], a['x'], a['y'], a['stamina'], a['wealth']] for a in agent_list]

        tx = self.factory_contract.functions.startGame(size, num_wealth, agent_count, _agent_list).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        print(f"start_game(): {tx.hex()}")

        # wait receipt
        tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx)
        # decode event
        event = self.factory_contract.events.NewGame().process_receipt(tx_receipt)[0]
        # get gameplay contract address
        gameplay_contract_address = event.args['gamePlayAddress']
        print(f"gameplay_contract_address: {gameplay_contract_address}")

        self.gameplay_contract = self.web3.eth.contract(address=gameplay_contract_address,
                                                   abi=load_abi_from_path('./abis/GamePlay.json'))

        return tx.hex()

    def start_llm(self):
        for _ in range(10): #define max number of round
            agent_list = self.get_explorer_list()
            for agent in agent_list:
                print(agent)
                agent_id = agent['id']
                surroundings = self.get_surroundings(agent_id)
                allowed_actions = self.get_allowed_actions(agent_id)
                if allowed_actions is None:
                    # maybe dead
                    continue
                explorer = self.get_agent(agent_id)
                print(self.agent_list)
                print(self.agent_list[agent_id])

                action = self.agent_list[agent_id].take_action(surroundings, allowed_actions, explorer['stamina'], explorer['wealth'])
                print(f"action: {action}")
                if action is None:
                    # I don't know why, but I'm handling it because it sometimes turns out to be none.
                    # Better than falling off.
                    continue
                elif 'move' in action:
                    _, direction = action.split(" ")
                    self.move(agent_id, direction)
                elif 'gather' in action:
                    self.gather_wealth(agent_id)
                elif 'rest' in action:
                    self.rest(agent_id)
                elif 'attack' in action:
                    _, t = action.split(" ")
                    if t in ['up', 'down', 'left', 'right']:
                        target_id = self.get_explorer_id_by_direction(self_id=agent_id, self_pos=None, direction=t)
                        self.attack(agent_id, target_id)
                    else:
                        self.attack(agent_id, t)


    def get_explorer_id_by_direction(self, self_id, self_pos, direction) -> str:
        direction = direction.lower()
        assert direction in ["up", "down", "left", "right"], WorldError("Invalid direction")

        explorers = {}
        explorers_onchain = self.get_explorer_list()
        for e in explorers_onchain:
            explorers[e["id"]] = e

        if self_pos:
            x, y = self_pos
        elif self_id:
            x, y = explorers[self_id]['x'], explorers[self_id]['y']
        else:
            raise Exception("Either self_pos or self_id must be provided")

        if direction == "down":
            x_, y_ = x, y - 1
        elif direction == "up":
            x_, y_ = x, y + 1
        elif direction == "left":
            x_, y_ = x - 1, y
        elif direction == "right":
            x_, y_ = x + 1, y

        for explor_id in explorers.keys():
            if explorers[explor_id]['x'] == x_ and explorers[explor_id]['y'] == y_:
                return explor_id

        raise WorldError("There is no explorer at the given direction: {}".format(direction))


    # move explorer
    # onlyOwner
    # agent_id: uint256
    # direction: string(up | down | left | right)
    def move(self, agent_id, direction):
        try:
            tx = self.gameplay_contract.functions.move(agent_id, direction).transact({
                "gasPrice": self.web3.eth.gas_price
            })
            print(f"move(): {tx.hex()}")
            return tx.hex()
        except Exception as e:
            print(e)
            return None

    # gather wealth
    # onlyOwner
    # agent_id: uint256
    def gather_wealth(self, agent_id):
        try:
            tx = self.gameplay_contract.functions.gatherWealth(agent_id).transact({
                "gasPrice": self.web3.eth.gas_price
            })
            print(f"gather_wealth(): {tx.hex()}")
            return tx.hex()
        except Exception as e:
            print(e)
            return None

    # rest
    # onlyOwner
    # agent_id: uint256
    def rest(self, agent_id):
        try:
            tx = self.gameplay_contract.functions.rest(agent_id).transact({
                "gasPrice": self.web3.eth.gas_price
            })
            print(f"rest(): {tx.hex()}")
            return tx.hex()
        except Exception as e:
            print(e)
            return None

    # attack
    # onlyOwner
    # attacker_id: int
    # defender_id: int
    def attack(self, attacker_id, defender_id):
        try:
            tx = self.gameplay_contract.functions.attack(attacker_id, defender_id).transact({
                "gasPrice": self.web3.eth.gas_price
            })
            print(f"attack(): {tx.hex()}")
            return tx.hex()
        except Exception as e:
            print(e)
            return None

    # get surroundings
    # agent_id: uint256
    def get_surroundings(self, agent_id):
        return self.gameplay_contract.functions.getSurroundings(agent_id).call()

    # get allowed actions
    # agent_id: uint256
    def get_allowed_actions(self, agent_id):
        try:
            return self.gameplay_contract.functions.getAllowedActions(agent_id).call()
        except Exception as e:
            print(e)
            return None

    # get world state
    def get_world_state(self):
        return self.gameplay_contract.functions.getWorldState().call()

    # setLocation
    # agent_id: uint256
    # x: uint256
    # y: uint256
    def set_location(self, agent_id, x, y):
        tx = self.gameplay_contract.functions.setLocation(agent_id, x, y).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        print(f"set_location(): {tx.hex()}")
        return tx.hex()

    # set stamina
    # agent_id: uint256
    # stamina: uint256
    def set_stamina(self, agent_id, stamina):
        tx = self.gameplay_contract.functions.setStamina(agent_id, stamina).transact({
            "gasPrice": self.web3.eth.gas_price
        })
        print(f"set_stamina(): {tx.hex()}")
        return tx.hex()

    # get agent
    # agent_id: uint256
    def get_agent(self, agent_id):
        r = self.gameplay_contract.functions.getAgent(agent_id).call()
        result = {"id": r[0], "name": r[1], "x": r[2], "y": r[3], "stamina": r[4], "wealth": r[5]}

        return result
    
    # getExplorerList
    def get_explorer_list(self):
        res = self.gameplay_contract.functions.getExplorerList().call()
        result = [{"id": r[0], "name": r[1], "x": r[2], "y": r[3], "stamina": r[4], "wealth": r[5]} for r in res]
        return result

    
    # faucet
    # address: string
    def faucet(self, address):
        if not address:
            address = self.account.address

        # hardhat only
        self.web3.provider.make_request("hardhat_setBalance", [address, "0x100000000000000000"])


class WorldError(Exception):
    """
    Exception raised for errors in the world. To feed back into the chatbot.
    """
    pass
