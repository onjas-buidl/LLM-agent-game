import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  const [size, setSize] = useState(10);
  const [numWealth, setNumWealth] = useState(10);
  const [agentCount, setAgentCount] = useState(30);
  const [agents, setAgents] = useState([
    { name: "TestA", x: 1, y: 2, stamina: 10, wealth: 4 },
    { name: "TestB", x: 10, y: 10, stamina: 10, wealth: 10 },
  ]);

  const startGame = async () => {
    try {
      const response = await axios.post("http://localhost:9000/start_game", {
        size,
        num_wealth: numWealth,
        agent_count: agentCount,
        agent_list: agents,
      });

      if (response.status === 200) {
        setMessage("success");
        setTimeout(() => setMessage(null), 10000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getWorldState = async () => {
    try {
      const response = await axios.get("http://localhost:9000/get_world_state");

      if (response.status === 200) {
        setWorldState(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(getWorldState, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="app">
      <form onSubmit={(e) => e.preventDefault()}>
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

      {/* Success message */}
      {message && <div>{message}</div>}

      {/* World state */}
      {worldState.map((row, i) => (
        <div key={i}>
          {row.map((cell, j) => (
            <div key={j}>
              {cell.cellValue === "W" && <div>💰</div>}
              {cell.agentValue && <div>{cell.agentValue}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
