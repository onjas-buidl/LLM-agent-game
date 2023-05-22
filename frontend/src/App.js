import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  const [size, setSize] = useState(10);
  const [numWealth, setNumWealth] = useState(10);
  const [agentCount, setAgentCount] = useState(30);
  const [agents, setAgents] = useState([
    { name: "TestA", x: 1, y: 2, stamina: 10, wealth: 4 },
    { name: "TestB", x: 10, y: 10, stamina: 10, wealth: 10 },
  ]);

  const startGame = () => {
    axios
      .post("/start_game_mock", {
        size,
        num_wealth: numWealth,
        agent_count: agentCount,
        agent_list: agents,
      })
      .then((response) => {
        setMessage("Success!");
        setTimeout(() => {
          setMessage(null);
        }, 10000);
        setGameStarted(true);
        // polling get world status api
        const intervalId = setInterval(() => {
          axios
            .get("/get_world_state_mock")
            .then((response) => {
              if (response.data.length > 0) {
                // check if the response data is not empty
                setWorldState(response.data);
              }
            })
            .catch((err) => console.error(err));
        }, 2000);
        return () => clearInterval(intervalId);
      })
      .catch((error) => {
        console.error("Failed to call API", error);
      });
  };

  return (
    <div className="app">
      {gameStarted ? null : (
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Size:
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
          </label>
          <label>
            Number of Wealth:
            <input
              type="number"
              value={numWealth}
              onChange={(e) => setNumWealth(+e.target.value)}
            />
          </label>
          <label>
            Number of Agents:
            <input
              type="number"
              value={agentCount}
              onChange={(e) => setAgentCount(+e.target.value)}
            />
          </label>
          {agents.map((agent, i) => (
            <div key={i}>
              <label>
                Agent Name:
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].name = e.target.value;
                    setAgents(newAgents);
                  }}
                />
              </label>
              <button
                onClick={() => {
                  const newAgents = [...agents];
                  newAgents.splice(i, 1);
                  setAgents(newAgents);
                }}
              >
                Remove Agent
              </button>
            </div>
          ))}
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
          <button onClick={startGame}>Start Game</button>
        </form>
      )}

      {/* Success message */}
      {message && <div>{message}</div>}

      {/* World state */}
      {gameStarted ? (
        <div className="container">
          <div className="grid-container">
            {worldState.length > 0 ? (
              worldState.map((row, i) => (
                <div key={`row-${i}`} className="grid-row">
                  {row.map((cell, j) => (
                    <div key={`cell-${i}-${j}`} className="grid-cell">
                      {cell === "W" ? <span className="coin">💰</span> : ""}
                      {cell !== "W" && cell !== "null" ? (
                        <span className="agent">{cell}</span>
                      ) : (
                        <span className="null">{}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
