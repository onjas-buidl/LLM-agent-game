import os
import json
from flask import Flask
from flask_restx import Api, Resource
from web3game import Web3Game

app = Flask(__name__)
api = Api(app)
web3Game = Web3Game("0x2e501612840d420598Ee8463907C924A63E9Ff8b",
                    "0x2e501612840d420598Ee8463907C924A63E9Ff8b")


# transfer ownership of the gameplay contract
# onlyOwner
# new_owner: address
@api.route('/set_owner/')
class SetOwner(Resource):
    def post(self):
        body = request.json

        ret = web3Game.set_owner(body.new_owner)
        return {
            "hash": ret,
        }


# map initialization
# onlyOwner
# size: uint256
# numWealth: uint256
@api.route('/random_initialize_map/')
class RandomInitializeMap(Resource):
    def post(self):
        body = request.json

        ret = web3Game.random_initialize_map(body.size, body.num_wealth)
        return {
            "hash": ret,
        }


# TODO: module system not implemented yet
@api.route('/deploy_contracts/')
class DeployContracts(Resource):
    def post(self):
        body = request.json

        ret = web3Game.deploy_contracts(body.module_list)
        return {
            "hash": ret,
        }


# add explorer
# onlyOwner
# name: string
# x: uint256
# y: uint256
# stamina: uint256
# wealth: uint256
@api.route('/add_explorer/')
class AddExplorer(Resource):
    def post(self):
        body = request.json

        ret = web3Game.add_explorer(
            body.name, body.x, body.y, body.stamina, body.wealth)
        return {
            "hash": ret,
        }


# move explorer
# onlyOwner
# name: string
# direction: string(up | down | left | right)
@api.route('/move/')
class Move(Resource):
    def post(self):
        body = request.json

        ret = web3Game.move(
            body.name, body.direction)
        return {
            "hash": ret,
        }


# gather wealth
# onlyOwner
# name: string
@api.route('/gather_wealth/')
class GatherWealth(Resource):
    def post(self):
        body = request.json

        ret = web3Game.gather_wealth(
            body.name)
        return {
            "hash": ret,
        }


# rest
# onlyOwner
# name: string
@api.route('/rest/')
class Rest(Resource):
    def post(self):
        body = request.json

        ret = web3Game.rest(
            body.name)
        return {
            "hash": ret,
        }


# attack
# onlyOwner
# attackerName: string
# defenderName: string
@api.route('/attack/')
class Attack(Resource):
    def post(self):
        body = request.json

        ret = web3Game.attack(
            body.attacker_name, body.defender_name)
        return {
            "hash": ret,
        }


# setLocation
# name: string
# x: uint256
# y: uint256
@api.route('/set_location/')
class SetLocation(Resource):
    def post(self):
        body = request.json

        ret = web3Game.set_location(
            body.name, body.x, body.y)
        return {
            "hash": ret,
        }


# set stamina
# name: string
# stamina: uint256
@api.route('/set_stamina/')
class SetStamina(Resource):
    def post(self):
        body = request.json

        ret = web3Game.set_stamina(
            body.name, body.stamina)
        return {
            "hash": ret,
        }


# get surroundings
# name: string
@api.route('/get_surroundings/<string:name>')
class GetSurroundings(Resource):
    def get(self, name):
        ret = web3Game.get_surroundings(name)
        return {
            "ret": ret,
        }


# get allowed actions
# name: string
@api.route('/get_allowed_actions/<string:name>')
class GetAllowedActions(Resource):
    def get(self, name):
        ret = web3Game.get_allowed_actions(name)
        return {
            "ret": ret,
        }


# get agent
# name: string
@api.route('/get_agent/<string:name>')
class GetAgent(Resource):
    def get(self, name):
        ret = web3Game.get_agent(name)
        return {
            "ret": ret,
        }


# get world state
@api.route('/get_world_state/')
class GetWorldState(Resource):
    def get(self):
        ret = web3Game.get_world_state()
        return {
            "ret": ret,
        }


if __name__ == '__main__':
    # app.run(debug=True)
    app.run(debug=os.environ.get('ISDEBUG', True), threaded=True, host='0.0.0.0',
            port=int(os.environ.get('PORT', 8080)))
