// Script Version for demo purpose

// import axios from "axios";
import { useState } from "react";
import "./Game.css";

//axios.defaults.baseURL = "http://localhost:8080";

const DEFAULT_AGENTS = [
    {
        name: "Alice",
        model: "GPT-3.5",
        x: 0,
        y: 0,
        stamina: 10,
        wealth: 0,
        strategy: "You only want to attack. You actively move towards Bob and attack it. You do not care anything else! ",
      },
    {
      name: "Bob",
      model: "Alpaca",
      x: 1,
      y: 0,
      stamina: 5,
      wealth: 0,
      strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
    },
];
const DEFAULT_MODULE = [
  {
    name: "Teleport",
    description: "will move to a random cell",
    x: 2,
    y: 3
  }
]

//TODO: add function that moves an agent to grid x,y pixel on web page
//TODO: add function that increase or decrease wealth of an agent
//TODO: add function that increase or decrease stamina of an agent


export default function  Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  // const [actionHistory, setActionHistory] = useState([]); 
  const [size, setSize] = useState(6);
  const [numWealth, setNumWealth] = useState(10);
  const [modules, setModules] = useState(DEFAULT_MODULE);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);

  const handleStartGame = async () => {
    setMessage("Starting the game ...");
    setAgents([]);
    setMessage("Successfully started the game!");

    setTimeout(() => setGameStarted(true), 1000);
    setTimeout(() => setMessage(null), 1000);

    setAgents(DEFAULT_AGENTS);
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
                agent.stamina > 0 &&
                <div
                  key={`spirit-agent-${index}`}
                  className="agent"
                  style={{
                    left: 80 * agent.x,
                    top: 80 * agent.y,
                  }}
                >
                  <div className="name">{agent.name}</div>
                  {agent.name.startsWith("A") ? (
                    <div
                      className="stamina-red"
                      style={{
                        width: `${Math.max(agent.stamina * 5, 80)}%`,
                      }}
                    ></div>) : (
                    <div
                      className="stamina-blue"
                      style={{
                        width: `${Math.max(agent.stamina * 5, 80)}%`,
                      }}
                    ></div>
                  )}
                </div>
              ))}
              {worldState.map((row, i) =>
                row.map((cell, j) =>
                  cell.startsWith("W") ? (
                    <div
                      key={`spirit-gold-${i}-${j}`}
                      className="gold"
                      style={{
                        left: 80 * j,
                        top: 80 * i,
                      }}
                    >
                      💰
                    </div>
                  ) : ((cell === "Teleport") ? (
                    <div
                      key={`spirit-teleport-${i}-${j}`}
                      className="teleport"
                      style={{
                        left: 80 * j,
                        top: 80 * i,
                      }}
                    >
                      🚪
                    </div>
                  ) : null)
                )
              )}
            </div>
            {/* <div className="actions">
            <div className="title">Action History</div>
            {actionHistory.map((action, i) => (
              <div key={i} className="action">
                <div className="act">{action}</div>
              </div>
              ))}
          </div> */}
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
          <div className="title">Modules</div>
          <div className="modules">
            {modules.map((module, i) => (
              <div className="module" key={i}>
                <input
                  className="name"
                  placeholder="Module name"
                  type="text"
                  value={module.name}
                  onChange={(e) => {
                    const newModules = [...modules];
                    newModules[i].name = e.target.value;
                    setModules(newModules);
                  }}
                />
                <input
                  className="description"
                  placeholder="Please write description for this module"
                  type="text"
                  value={module.description}
                  onChange={(e) => {
                    const newModules = [...modules];
                    newModules[i].description = e.target.value;
                    setModules(newModules);
                  }}
                />
                <div className="location">
                  <label>X:</label>
                  <input
                    type="number"
                    value={module.x}
                    onChange={(e) => {
                      const newModules = [...modules];
                      newModules[i].x = +e.target.value;
                      setModules(newModules);
                    }}
                  />
                  <label>Y:</label>
                  <input
                    type="number"
                    value={module.y}
                    onChange={(e) => {
                      const newModules = [...modules];
                      newModules[i].y = +e.target.value;
                      setModules(newModules);
                    }}
                  />
                </div>
                <button
                  className="remove"
                  onClick={() => {
                    const newModules = [...modules];
                    newModules.splice(i, 1);
                    setModules(newModules);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
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
                  className="llm"
                  placeholder="Empower your Agent with an open selection of models"
                  type="text"
                  value={agent.model}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].model = e.target.value;
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
            <button
              onClick={() =>
                setModules([
                  ...modules,
                  { name: "", description: "", x: 0, y: 0 },
                ])
              }
            >
              Add Module
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
