import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
axios.defaults.baseURL = "http://localhost:8080";
function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  const [size, setSize] = useState(10);
  const [numWealth, setNumWealth] = useState(30);
  const [agents, setAgents] = useState([
    { name: "Yijia", x: 1, y: 2, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Kevin", x: 5, y: 8, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Jason", x: 8, y: 5, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Will", x: 4, y: 4, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Yan", x: 3, y: 8, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Harry", x: 4, y: 6, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Jiaqi", x: 6, y: 1, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Peter", x: 2, y: 4, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Yash", x: 4, y: 8, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Coco", x: 7, y: 3, stamina: 10, wealth: 0, strategy: "Please set" },
    { name: "Modeo", x: 8, y: 6, stamina: 10, wealth: 0, strategy: "Please set" },
  ]);

  const startGame = () => {
    axios
      .post("/start_game/", {
        size,
        num_wealth: numWealth,
        agent_list: agents,
      })
      .then((response) => {
        setMessage("Successfully started the game!");
        setTimeout(() => {
          setMessage(null);
        }, 10000);
        setGameStarted(true);

        axios.post("/start_llm/").then((response) => {
          console.log("Successfully started the LLM!");
        })

        // polling get world status api
        const intervalId = setInterval(() => {
          axios
            .get("/get_world_state/")
            .then((response) => {
              console.log("Current world state:");
              console.log(response.data);
              if (response.data.ret.length > 0) {
                // check if the response data is not empty
                setWorldState(response.data.ret);
              }
            })
            .catch((err) => console.error(err));
        }, 5000);
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
            Map Size:
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
              <label>
                X:
                <input
                  type="text"
                  value={agent.x}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].x = e.target.value;
                    setAgents(newAgents);
                  }}
                />
              </label>
              <label>
                Y:
                <input
                  type="text"
                  value={agent.y}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].y = e.target.value;
                    setAgents(newAgents);
                  }}
                />
              </label>
              <label>
                Strategy:
                <input
                  type="text"
                  value={agent.strategy}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].strategy = e.target.value;
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
                        <span className="null">{ }</span>
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
