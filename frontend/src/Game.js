import axios from "axios";
import { useState } from "react";
import "./Game.css";

axios.defaults.baseURL = "http://localhost:8080";

const DEFAULT_AGENTS = [
  {
    name: "Yijia",
    x: 1,
    y: 2,
    stamina: 10,
    wealth: 0,
    strategy: "",
  },
  {
    name: "Kevin",
    x: 5,
    y: 8,
    stamina: 10,
    wealth: 0,
    strategy: "",
  },
  {
    name: "Coco",
    x: 7,
    y: 3,
    stamina: 10,
    wealth: 0,
    strategy: "",
  },
];

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  const [size, setSize] = useState(10);
  const [numWealth, setNumWealth] = useState(30);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);

  const handleStartGame = async () => {
    setMessage("Starting the game ...");

    await axios.post("/start_game/", {
      size,
      num_wealth: numWealth,
      agent_list: agents,
    });

    setMessage("Successfully started the game!");

    setTimeout(() => setGameStarted(true), 1000);
    setTimeout(() => setMessage(null), 5000);

    axios.post("/start_llm/").catch();

    setInterval(() => {
      axios
        .get("/get_world_state/")
        .then((worldRes) => {
          console.log("Current world state:");
          console.log(worldRes.data);

          Promise.all(
            agents.map((_, agentId) => axios.get(`/get_agent/${agentId}`))
          ).then((results) => {
            const newAgents = [...agents];

            for (const result of results) {
              newAgents[result.data.ret.id - 1] = result.data.ret;
            }

            setAgents(newAgents);

            if (worldRes.data.ret.length > 0) {
              // check if the response data is not empty
              setWorldState(worldRes.data.ret);
            }
          });
        })
        .catch((err) => console.error(err));
    }, 1000);
  };

  const view = (() => {
    if (gameStarted) {
      return (
        <main className="game">
          <div className="leaderboard">
            <div className="title">Leaderboard</div>
            {[...agents]
              .sort((a, b) => b.wealth - a.wealth)
              .map((agent) => (
                <div key={agent.name} className="agent">
                  <div className="name">{agent.name}</div>
                  <div className="wealth">{agent.wealth}</div>
                </div>
              ))}
          </div>
          <div className="present">
            <div
              className="map"
              style={{
                width: size * 80,
                height: size * 80,
              }}
            >
              {Array(size * size)
                .fill()
                .map((_, i) => (
                  <div key={`grid_${i}`} className="grid"></div>
                ))}

              {agents.map((agent, index) => (
                <div
                  key={`spirit-agent-${index}`}
                  className="agent"
                  style={{
                    left: 80 * agent.x,
                    top: 80 * agent.y,
                  }}
                >
                  <div className="name">{agent.name}</div>
                  <div
                    className="stamina"
                    style={{
                      width: `${Math.max(agent.stamina * 5, 100)}%`,
                    }}
                  ></div>
                </div>
              ))}
              {worldState.map((row, i) =>
                row.map((cell, j) =>
                  cell.startsWith("W") ? (
                    <div
                      key={`spirit-gold-${i}-${j}`}
                      className="gold"
                      style={{
                        left: 80 * i,
                        top: 80 * j,
                      }}
                    >
                      💰
                    </div>
                  ) : null
                )
              )}
            </div>
          </div>
        </main>
      );
    } else {
      return (
        <main className="setup">
          <div className="brand">Colosseum</div>
          <div className="title">Game Settings</div>
          <div className="settings">
            <div className="setting">
              <label>Map Size:</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(+e.target.value)}
              />
            </div>
            <div className="setting">
              <label>Number of Wealth:</label>
              <input
                type="number"
                value={numWealth}
                onChange={(e) => setNumWealth(+e.target.value)}
              />
            </div>
          </div>
          <div className="title">Agents</div>
          <div className="agents">
            {agents.map((agent, i) => (
              <div className="agent" key={i}>
                <input
                  className="name"
                  placeholder="Agent name"
                  type="text"
                  value={agent.name}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].name = e.target.value;
                    setAgents(newAgents);
                  }}
                />
                <input
                  className="strategy"
                  placeholder="Please write strategy for this agent"
                  type="text"
                  value={agent.strategy}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].strategy = e.target.value;
                    setAgents(newAgents);
                  }}
                />
                <div className="location">
                  <label>X:</label>
                  <input
                    type="number"
                    value={agent.x}
                    onChange={(e) => {
                      const newAgents = [...agents];
                      newAgents[i].x = +e.target.value;
                      setAgents(newAgents);
                    }}
                  />
                  <label>Y:</label>
                  <input
                    type="number"
                    value={agent.y}
                    onChange={(e) => {
                      const newAgents = [...agents];
                      newAgents[i].y = +e.target.value;
                      setAgents(newAgents);
                    }}
                  />
                </div>
                <button
                  className="remove"
                  onClick={() => {
                    const newAgents = [...agents];
                    newAgents.splice(i, 1);
                    setAgents(newAgents);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="buttons">
            <button
              onClick={() =>
                setAgents([
                  ...agents,
                  { name: "", x: 0, y: 0, stamina: 0, wealth: 0 },
                ])
              }
            >
              Add Agent
            </button>
            <button onClick={handleStartGame}>Start Game</button>
          </div>
        </main>
      );
    }
  })();

  return (
    <>
      {view}
      {message && <div className="message">{message}</div>}
    </>
  );
}
