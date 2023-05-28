# NOTE: First of all, need to load the environment variables
from dotenv import load_dotenv
load_dotenv("./conf/local.env", verbose=True)
# DO NOT EDIT ^^^^^

from flask_cors import CORS
from web3game import Web3Game
from flask import Flask, request
import os
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
web3Game = Web3Game("0xAEdbF8bBcf26CE2F25DB396f0fB7daAa10e1c7A4")


@app.route("/start_game", methods=["POST"])
def start_game():
    body = request.get_json()
    
    ret = web3Game.start_game(
        body["size"], body["num_wealth"], body["agent_list"], body['module_list']
    )

    return {
        "hash": ret,
    }


# start_llm
@app.route("/start_llm", methods=["POST"])
async def start_llm():
    # body = request.json

    ret = await web3Game.start_llm()
    return {
        "hash": ret,
    }


@app.route("/get_explorers_list", methods=["GET"])
def get_explorers_list():
    ret = web3Game.get_explorers_list()
    return {
        "ret": ret,
    }


# get world state
@app.route("/get_world_state", methods=["GET"])
def get_world_state():
    ret = web3Game.get_world_state()
    return {
        "ret": ret,
    }

# faucet
# address: string
@app.route("/faucet/<string:address>", methods=["GET"])
def faucet(address):
    web3Game.faucet(address)
    return {
        "ret": "ok",
    }

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(
        debug=os.environ.get("ISDEBUG", True),
        threaded=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8080)),
    )
