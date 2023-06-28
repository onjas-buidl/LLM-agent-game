import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import "./Game.css";
import BarbarianIcon from './assets/Barbarian.gif'
import CavalryIcon from './assets/Cavalry.gif'
import HospitalModule from './assets/Hospital.gif'
import CrystalModule from './assets/Crystal.png'
import TeleportModule from './assets/Teleport.gif'
import NPCBarbarianIcon from './assets/NPC1.gif'
import NPCCavalryIcon from './assets/NPC2.gif'
import CrystalMineModule from './assets/CrystalMine.gif'
import MountainModule from './assets/Mountain.png'
import {
  ErrorCode,
  getWindowAI,
} from "window.ai"
import { DraggableCore } from "react-draggable";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


// initialize the window.ai client
// const ai = await getWindowAI();
// const model = ai.getCurrentModel();
// console.log(model);

axios.defaults.baseURL = "http://localhost:8080";


const DEFAULT_COMMANDER_1 = [
  {
    name: "commander_1",
    model: "gpt-3.5-turbo-16k",
    strategy: "You want to preserve as much stamina as possible while moving towards the enemy. You do not care about wealth.",
    selectedsoldiers: ["A", "B", "C"]
  },
  // {
  //   name: "Cavalry",
  //   model: "GPT-4",
  //   strategy: "You want to be very aggressive and very greedy. You want to gather as much wealth as possible while attacking the enemy. You do not care about stamina.",
  //   selectedsoldiers: ["D", "E", "F"]
  // },
];
const DEFAULT_SOLDIERS = [
  {
    name: "A",
    x: 10,
    y: 29,
    stamina: 5,
    image: BarbarianIcon,
  },
  {
    name: "B",
    x: 10,
    y: 30,
    stamina: 5,
    image: BarbarianIcon,
  },
  {
    name: "C",
    x: 10,
    y: 31,
    stamina: 5,
    image: BarbarianIcon,
  },
  {
    name: "D",
    x: 14,
    y: 30,
    stamina: 5,
    image: NPCBarbarianIcon,
  },
  {
    name: "E",
    x: 14,
    y: 31,
    stamina: 5,
    image: NPCBarbarianIcon,
  },
  {
    name: "F",
    x: 14,
    y: 32,
    stamina: 5,
    image: NPCBarbarianIcon,
  },
];

const DEFAULT_MODULE = [
  {
    name: "Hospital",
    description: "Add 1 stamina",
    x: 2,
    y: 3
  }
]

const DEFAULT_COMMANDER_2 = [
  {
    name: "commander_2",
    model: "gpt-3.5-turbo-16k",
    strategy: "soldiers always attack the competitor with the lowest stamina",
    selectedsoldiers: ["D", "E", "F"]
  },
]


export default function  Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  // const [actionHistory, setActionHistory] = useState([]); 
  const [size, setSize] = useState(70);
  const [gridSize, setGridSize] = useState(25);
  const [numWealth, setNumWealth] = useState(10);
  const [modules, setModules] = useState(DEFAULT_MODULE);
  const [soldiers, setSoldiers] = useState(DEFAULT_SOLDIERS);
  const [commander_1, setCommander_1] = useState(DEFAULT_COMMANDER_1);
  const [commander_2, setCommander_2] = useState(DEFAULT_COMMANDER_2);
  const [showBox, setShowBox] = useState(false);
  const [commands, setCommands] = useState([]);
  
  const handleClick = () => {
    setShowBox(!showBox);
    console.log("clicked");
};
  
  const handleStartGame = async () => {
    setMessage("Starting the game ...");
    await axios.post("/create_world/", {
      size,
    });
    setSoldiers([]);

    await axios.get("/start_game/", {
      size,
      commander_info: commander_1, // Add Commander_2
      soldier_info: soldiers,
      hospital_info: modules
    });
    // Initialize worldState map
    setWorldState(
      []
    );

    setTimeout(() => setGameStarted(true), 4000);
    setTimeout(() => setMessage(null), 3000);

    setSoldiers(DEFAULT_SOLDIERS);
    
    // const input = 'Once upon a time, ';
    // const options = {
    //   temperature: 0.7,
    //   maxTokens: 100,
    // };
    // const response = await window.ai.generateText({
    //   messages: [{ role: "user", content: "Who are you?" }]
    // });
    
    // console.log(response[0].message.content); // "I am an AI language model"
    setMessage("Successfully started the game!");
    setTimeout(() => setMessage(null), 2000);    

    setInterval(() => {
      axios
        .get("/get_world_state/")
        .then((worldRes) => {
          console.log("Current world state:");
          console.log(worldRes.data);
          if (worldRes.data.ret.length > 0) {
            //TODO: check if the response data is not empty
            setWorldState(worldRes.data.ret);
          }
        })
        .catch((err) => console.error(err));
    }, 1000);
  };

  const view = (() => {
    if (gameStarted) {
      return (
        <main className="game">
          <div className="leaderboard">
            <div className="title">Live Commands</div>
            {commands.map((command, index) => (
              <div key={index} className="command">
                {command}
              </div>
            ))}
          </div>
          <DraggableCore>
            <TransformWrapper
              options={{
                minScale: 0.01, // Adjust the minimum scale value
                maxScale: 2,   // Adjust the maximum scale value
              }}
            >
              <TransformComponent>
                <div className="present">
                  <div
                    className="map"
                    style={{
                      width: size * gridSize,
                      height: size * gridSize,
                    }}
                  >
                    {Array(size * size)
                      .fill()
                      .map((_, i) => (
                        <div key={`grid_${i}`} className="grid"></div>
                      ))}
                    {soldiers.map((soldier, index) => (
                      soldier.stamina > 0 && (
                        <div
                          key={`spirit-soldier-${index}`}
                          className="soldier"
                          style={{
                            left: gridSize * soldier.x,
                            top: gridSize * soldier.y,
                          }}
                        >
                          <div className="name">{soldier.name}</div>
                          <img src={soldier.image} alt={`soldier ${index + 1}`} className="image" onclick={handleClick}/>
                          {soldier.name.startsWith("A") ? (
                            <div className="stamina-red-container">
                              <div
                                className="stamina-red"
                                style={{
                                  width: `${Math.min(soldier.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.min(soldier.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                    {npc.map((soldier, index) => (
                      soldier.stamina > 0 && (
                        <div
                          key={`spirit-soldier-${index}`}
                          className="soldier"
                          style={{
                            left: gridSize * soldier.x,
                            top: gridSize * soldier.y,
                          }}
                        >
                          <div className="name">{soldier.name}</div>
                          <img src={soldier.image} alt={`soldier ${index + 1}`} className="image" />
                          {soldier.name.startsWith("A") ? (
                            <div className="stamina-red-container">
                              <div
                                className="stamina-red"
                                style={{
                                  width: `${Math.min(soldier.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.min(soldier.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  {worldState.map((row, i) =>
                    row.map((cell, j) =>
                      cell.startsWith("W") ? (
                        <div
                          key={`spirit-gold-${i}-${j}`}
                          className="gold"
                          style={{
                            left: gridSize * j,
                            top: gridSize * i,
                          }}
                        >
                          <img src={CrystalModule} className="crystal-image" />
                        </div>
                      ) : cell === "Teleport" ? (
                        <div
                          key={`spirit-teleport-${i}-${j}`}
                          className="teleport"
                          style={{
                            left: gridSize * j,
                            top: gridSize * i,
                          }}
                        >
                          <img src={TeleportModule} alt="Teleport"className="teleport-image"/>
                        </div>
                      ) : cell === "Hospital" ? (
                        <div
                          key={`spirit-hospital-${i}-${j}`}
                          className="hospital"
                          style={{
                            left: gridSize * j,
                            top: gridSize * i,
                          }}
                        >
                          <img src={HospitalModule} alt="Hospital" className="hospital-image"/>
                        </div>
                      ) : cell === "Mine" ? (
                        <div
                          key={`spirit-mine-${i}-${j}`}
                          className="mine"
                          style={{
                            left: gridSize * j,
                            top: gridSize * i,
                          }}
                        >
                          <img src={CrystalMineModule} alt="Mine" className="mine-image"/>
                        </div>
                      ) :cell === "Mountain" ? (
                        <div
                          key={`spirit-mountain-${i}-${j}`}
                          className="mountain"
                          style={{
                            left: gridSize * j,
                            top: gridSize * i,
                          }}
                        >
                          <img src={MountainModule} alt="Mountain" className="mountain-image"/>
                        </div>
                      ) : null
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
          </TransformComponent>
          </TransformWrapper>
        </DraggableCore>
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
          <div className="title">Commanders</div>


          <div className="soldiers">
            {commander_1.map((commander, i) => (
              <div className="soldier" key={i}>
                <input
                  className="name"
                  placeholder="soldier name"
                  type="text"
                  value={commander.name}
                  onChange={(e) => {
                    const newCommander_1 = [...commander_1];
                    newCommander_1[i].name = e.target.value;
                    setCommander_1(newCommander_1);
                  }}
                />
                <select
                  className="llm"
                  value={commander.model}
                  onChange={(e) => {
                    const newCommander_1 = [...commander_1];
                    newCommander_1[i].model = e.target.value;
                    setCommander_1(newCommander_1);
                  }}
                >
                  <option value="GPT-3.5">GPT-3.5-turbo(Default)</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Claude-v1">Claude-v1</option>
                  <option value="Alpaca">Alpaca</option>
                  <option value="Vicuna">Vicuna</option>
                </select>
                <input
                  className="strategy"
                  placeholder="Please write strategy for this soldier"
                  type="text"
                  value={commander.strategy}
                  onChange={(e) => {
                    const newCommander_1 = [...commander_1];
                    newCommander_1[i].strategy = e.target.value;
                    setCommander_1(newCommander_1);
                  }}
                /> 
                <br />
                <br />
                {soldiers
                .filter((soldier) => commander.selectedsoldiers.includes(soldier.name)) // Filter soldiers based on selectedsoldiers list
                .map((soldier, j) =>  (
                <><input
                className="name2"
                placeholder="soldier name"
                type="text"
                value={soldier.name}
                onChange={(e) => {
                  const newSoldiers = [...soldiers];
                  newSoldiers[j].name = e.target.value;
                  setCommander_1(newSoldiers);
                }}
              />
                <div className="location">
                    <label>X:</label>
                    <input
                      type="number"
                      value={soldier.x}
                      onChange={(e) => {
                        const newSoldiers = [...soldiers];
                        newSoldiers[j].x = +e.target.value;
                        setSoldiers(newSoldiers);
                      } } />
                    <label>Y:</label>
                    <input
                      type="number"
                      value={soldier.y}
                      onChange={(e) => {
                        const newSoldiers = [...soldiers];
                        newSoldiers[j].y = +e.target.value;
                        setSoldiers(newSoldiers);
                      } } />
                  </div></>
                    ))}
                    <button
                    className="remove"
                    onClick={() => {
                      const newSoldiers = [...soldiers];
                      newSoldiers.splice(i, 1);
                      setSoldiers(newSoldiers);
                    } }
                  >
                      Remove
                    </button>
              </div>
            ))}
          </div>

          <div className="soldiers">
            {commander_2.map((commander, i) => (
              <div className="soldier" key={i}>
                <input
                  className="name"
                  placeholder="soldier name"
                  type="text"
                  value={commander.name}
                  onChange={(e) => {
                    const newCommander_2 = [...commander_2];
                    newCommander_2[i].name = e.target.value;
                    setCommander_2(newCommander_2);
                  }}
                />
                <select
                  className="llm"
                  value={commander.model}
                  onChange={(e) => {
                    const newCommander_2 = [...commander_2];
                    newCommander_2[i].model = e.target.value;
                    setCommander_2(newCommander_2);
                  }}
                >
                  <option value="GPT-3.5">GPT-3.5-turbo(Default)</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Claude-v1">Claude-v1</option>
                  <option value="Alpaca">Alpaca</option>
                  <option value="Vicuna">Vicuna</option>
                </select>
                <input
                  className="strategy"
                  placeholder="Please write strategy for this soldier"
                  type="text"
                  value={commander.strategy}
                  onChange={(e) => {
                    const newCommander_2 = [...commander_2];
                    newCommander_2[i].strategy = e.target.value;
                    setCommander_2(newCommander_2);
                  }}
                /> 
                <br />
                <br />
                {soldiers
                .filter((soldier) => commander.selectedsoldiers.includes(soldier.name)) // Filter soldiers based on selectedsoldiers list
                .map((soldier, j) =>  (
                <><input
                className="name2"
                placeholder="soldier name"
                type="text"
                value={soldier.name}
                onChange={(e) => {
                  const newSoldiers = [...soldiers];
                  newSoldiers[j].name = e.target.value;
                  setCommander_1(newSoldiers);
                }}
              />
                <div className="location">
                    <label>X:</label>
                    <input
                      type="number"
                      value={soldier.x}
                      onChange={(e) => {
                        const newSoldiers = [...soldiers];
                        newSoldiers[j].x = +e.target.value;
                        setSoldiers(newSoldiers);
                      } } />
                    <label>Y:</label>
                    <input
                      type="number"
                      value={soldier.y}
                      onChange={(e) => {
                        const newSoldiers = [...soldiers];
                        newSoldiers[j].y = +e.target.value;
                        setSoldiers(newSoldiers);
                      } } />
                  </div></>
                    ))}
                    <button
                    className="remove"
                    onClick={() => {
                      const newSoldiers = [...soldiers];
                      newSoldiers.splice(i, 1);
                      setSoldiers(newSoldiers);
                    } }
                  >
                      Remove
                    </button>
              </div>
            ))}
          </div>

          
          <div className="buttons">
            <button
              onClick={() =>
                setSoldiers([
                  ...soldiers,
                  { name: "", x: 0, y: 0, stamina: 0, wealth: 0 },
                ])
              }
            >
              Add Army
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
