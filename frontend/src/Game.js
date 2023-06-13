// Script Version for demo purpose

// import axios from "axios";
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


// initialize the client
const ai = await getWindowAI();

const model = ai.getCurrentModel();
console.log(model);

//axios.defaults.baseURL = "http://localhost:8080";


const DEFAULT_COMMANDER = [
  {
    name: "Infantry",
    model: "GPT-3.5",
    strategy: "",
    selectedAgents: ["Alice", "Bob"]
  },
  {
    name: "Cavalry",
    model: "GPT-4",
    strategy: "",
    selectedAgents: ["Alex", "Dora"]
  },
];
const DEFAULT_AGENTS = [
  {
    name: "A",
    model: "GPT-3.5",
    x: 10,
    y: 29,
    stamina: 5,
    wealth: 0,
    strategy: "You only want to attack. You actively move towards Bob and attack it. You do not care anything else! ",
    image: BarbarianIcon,
  },
  {
    name: "B",
    model: "Alpaca",
    x: 10,
    y: 30,
    stamina: 5,
    wealth: 0,
    strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
    image: BarbarianIcon,
  },
  // {
  //   name: "C",
  //   model: "GPT-4",
  //   x: 10,
  //   y: 31,
  //   stamina: 5,
  //   wealth: 0,
  //   strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
  //   image: BarbarianIcon,
  // },
  {
    name: "D",
    model: "Vicuna",
    x: 14,
    y: 30,
    stamina: 5,
    wealth: 0,
    strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
    image: CavalryIcon,
  },
  {
    name: "E",
    model: "GPT",
    x: 14,
    y: 31,
    stamina: 5,
    wealth: 0,
    strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
    image: CavalryIcon,
  },
  {
    name: "F",
    model: "Vicuna",
    x: 14,
    y: 32,
    stamina: 5,
    wealth: 0,
    strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
    image: CavalryIcon,
  },
];
const DEFAULT_MODULE = [
  {
    name: "Teleport",
    description: "will move agent to a random cell",
    x: 2,
    y: 3
  }
]
const x_basis = 10; 
const y_basis = 29;
const DEFAULT_NPC = [

  { name: "E1", x: x_basis+2, y: y_basis-2, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  { name: "E2", x: x_basis+3, y: y_basis-3, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  { name: "E3", x: x_basis+2, y: y_basis-4, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  // { name: "Grace", x: 12, y: 27, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Henry", x: 30, y: 25, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Ivy", x: 14, y: 6, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Jack", x: 23, y: 19, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Kate", x: 32, y: 9, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Liam", x: 42, y: 16, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Mia", x: 7, y: 39, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  // { name: "Nick", x: 21, y: 30, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  // { name: "Olivia", x: 37, y: 22, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Parker", x: 13, y: 17, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Quinn", x: 29, y: 8, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Ryan", x: 4, y: 33, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Sophia", x: 27, y: 14, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Thomas", x: 38, y: 26, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Uma", x: 11, y: 37, stamina: 5, wealth: 0, image: BarbarianIcon },
  // { name: "Vincent", x: 25, y: 28, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Willow", x: 35, y: 20, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Vitalik", x: 63, y: 3, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  // { name: "Xavier", x: 9, y: 11, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Yvonne", x: 24, y: 2, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Zachary", x: 34, y: 13, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Ava", x: 8, y: 24, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Benjamin", x: 28, y: 15, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Charlotte", x: 3, y: 36, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Daniel", x: 22, y: 27, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Emma", x: 36, y: 19, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Felix", x: 10, y: 10, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Grace", x: 26, y: 1, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Henry", x: 39, y: 12, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Yan", x: 12, y: 23, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Jack", x: 31, y: 14, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Kate", x: 5, y: 35, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Liam", x: 20, y: 26, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Will", x: 33, y: 18, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  // { name: "Noah", x: 6, y: 9, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Olivia", x: 19, y: 0, stamina: 5, wealth: 0, image: CavalryIcon },
  // { name: "Jason", x: 30, y: 11, stamina: 5, wealth: 0, image: CavalryIcon },
]


export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState(null);
  const [worldState, setWorldState] = useState([]);
  // const [actionHistory, setActionHistory] = useState([]); 
  const [size, setSize] = useState(70);
  const [gridSize, setGridSize] = useState(25);
  const [numWealth, setNumWealth] = useState(10);
  const [modules, setModules] = useState(DEFAULT_MODULE);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [commanders, setCommanders] = useState(DEFAULT_COMMANDER);
  const [npc, setNPC] = useState(DEFAULT_NPC);

  const handleStartGame = async () => {
    setMessage("Starting the game ...");
    setAgents([]);

    // Initialize worldState map
    setWorldState(
      [
        ['', '', '', 'W', '', '', 'Mine', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', ''],
        ['', 'Teleport', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain'],
        ['', 'Mountain', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain'],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', 'Mountain', 'Mountain'],
        ['W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain'],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', ''],
        ['W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', 'W', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', 'Hospital', 'Mountain', '', '', '', '', '', '', 'Teleport', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', 'W', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Mountain', '', '', 'W', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain'],
        ['Mountain', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain'],
        ['', '', '', 'W', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', 'Mine', 'Mine', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', 'Mine', 'Mine', 'Mine', 'Mine', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', 'W'],
        ['', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'W', 'Mine', 'Mine', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', 'W', 'W', 'Mine', 'W', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', 'Mine', 'Mine', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', 'Mine', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', 'Mine', 'W', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', 'Teleport', '', '', 'W', '', 'W', 'W', 'W', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', 'W', '', '', '', 'Mountain', 'Mountain', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', 'Mountain', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', 'Mountain', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine'],
        ['', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mountain', 'Mountain', '', '', '', '', 'W', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', 'Mine', '', '', '', '', '', '', '', 'W', '', '', '', '', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'],
      ]
    );

    setTimeout(() => setGameStarted(true), 4000);
    setTimeout(() => setMessage(null), 3000);

    setAgents(DEFAULT_AGENTS);

    const input = 'Once upon a time, ';
    const options = {
      temperature: 0.7,
      maxTokens: 100,
    };

    // ai.generateText(input, options).then((results) => {
    //   // Process the completion results
    //   console.log(results);
    // })
    // .catch((error) => {
    //   // Handle any errors
    //   console.error(error);
    // });
    const response = await window.ai.generateText({
      messages: [{ role: "user", content: "Who are you?" }]
    });

    console.log(response[0].message.content); // "I am an AI language model"
    setMessage("Successfully started the game!");
    setTimeout(() => setMessage(null), 2000);

  };

  // Demo Script Functions
  const moveAgentToPosition = (agentName, targetX, targetY, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.name === agentName ? { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1 } : agent
        )
      );
    }, delay);
  };

  const moveAgentDirection = (agentName, direction, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.name === agentName) {
            let newX = agent.x;
            let newY = agent.y;

            if (direction === "left") {
              newX -= 1;
            } else if (direction === "right") {
              newX += 1;
            } else if (direction === "up") {
              newY -= 1;
            } else if (direction === "down") {
              newY += 1;
            }

            return { ...agent, x: newX, y: newY, stamina: agent.stamina };
          } else {
            return agent;
          }
        })
      );
    }, delay);
  };
  
  const moveNPCDirection = (npcName, direction, delay) => {
    setTimeout(() => {
      setNPC((prevAgents) =>
        prevAgents.map((npc) => {
          if (npc.name === npcName) {
            let newX = npc.x;
            let newY = npc.y;

            if (direction === "left") {
              newX -= 1;
            } else if (direction === "right") {
              newX += 1;
            } else if (direction === "up") {
              newY -= 1;
            } else if (direction === "down") {
              newY += 1;
            }

            return { ...npc, x: newX, y: newY, stamina: npc.stamina };
          } else {
            return npc;
          }
        })
      );
    }, delay);
  };
  

  // const moveAgent = (agentName, targetX, targetY, delay) => {
  //   setTimeout(() => {
  //     setAgents((prevAgents) =>
  //       prevAgents.map((agent) =>
  //         agent.name === agentName ? { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1 } : agent
  //       )
  //     );
  //   }, delay);
  // };

  // const moveNPC = (agentName, targetX, targetY, delay) => {
  //   setTimeout(() => {
  //     setAgents((prevAgents) =>
  //       prevAgents.map((agent) =>
  //         agent.name === agentName ? { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1 } : agent
  //       )
  //     );
  //   }, delay);
  // };

  const moveNPCToPosition = (agentName, targetX, targetY, delay) => {
    setTimeout(() => {
      setNPC((prevAgents) =>
        prevAgents.map((npc) =>
          npc.name === agentName ? { ...npc, x: targetX, y: targetY, stamina: npc.stamina - 1 } : npc
        )
      );
    }, delay);
  };

  const attackAgent = (attackerName, defenderName, targetX, targetY, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.name === defenderName) {
            return { ...agent, stamina: 0 };
          } else if (agent.name === attackerName) {
            return { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1 };
          } else {
            return agent;
          }
        })
      );
    }, delay);
  };

  const reduceStamina = (agentName, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) => {
        const updatedAgents = prevAgents.map((agent) =>
          agent.name === agentName
            ? { ...agent, stamina: agent.stamina - 1 }
            : agent
        );
        const agent = updatedAgents.find((agent) => agent.name === agentName);
        if (agent) {
          console.log(`${agentName} stamina: ${agent.stamina}`);
        }
        return updatedAgents;
      });
    }, delay);
  };

  const NPCreduceStamina = (npcName, delay) => {
    setTimeout(() => {
      setNPC((prevNPC) => {
        const updatedNPC = prevNPC.map((npc) =>
          npc.name === npcName
            ? { ...npc, stamina: npc.stamina - 1 }
            : npc
        );
        const npc = updatedNPC.find((npc) => npc.name === npcName);
        if (npc) {
          console.log(`${npcName} stamina: ${npc.stamina}`);
        }
        return updatedNPC;
      });
    }, delay);
  };
  
  


  const gatherGold = (agentName, targetX, targetY, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((prevAgent) =>
          prevAgent.name === agentName
            ? { ...prevAgent, wealth: prevAgent.wealth + 1, stamina: prevAgent.stamina - 1 }
            : prevAgent
        )
      );

      setWorldState((prevWorldState) =>
        prevWorldState.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex === targetY && colIndex === targetX ? cell.replace('W', '') : cell
          )
        )
      );
    }, delay);
  };

  const rest = (agentName, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((prevAgent) =>
          prevAgent.name === agentName
            ? { ...prevAgent, stamina: prevAgent.stamina + 3 }
            : prevAgent
        )
      );
    }, delay);
  };


  useEffect(() => {
    if (gameStarted) {
      const term_length = 2000;
      const x_basis = 10; 
      const y_basis = 29;
      const degree_of_random = 200;

      
      // 1 
      var term_num = 1;
      // default method to move an agent 
      moveAgentDirection("A", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("B", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      
      
      // 2
      term_num = 2;
      moveAgentDirection("A", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("B", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveNPCDirection("E1", "down", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveNPCDirection("E2", "down", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveNPCDirection("E3", "down", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      // 3
      term_num = 3;
      moveAgentDirection("A", "right", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("B", "right", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      // moveNPCDirection("E1", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      // moveNPCDirection("E2", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      // moveNPCDirection("E3", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      // 4
      term_num = 4;
      moveNPCDirection("E2", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      reduceStamina("A", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      reduceStamina("B", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E1", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E2", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      moveAgentDirection("D", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("E", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("F", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      moveAgentDirection("D", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("E", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("F", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      moveAgentDirection("D", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("E", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("F", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);


      // 5
      term_num = 5;
      moveAgentDirection("D", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("E", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("F", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      // moveAgentDirection("D", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      // moveAgentDirection("E", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      // moveAgentDirection("F", "left", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      moveAgentDirection("D", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("E", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      moveAgentDirection("F", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);

      reduceStamina("A", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      reduceStamina("B", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E1", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E2", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E1", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E2", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);



      // 6
      reduceStamina("A", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      reduceStamina("B", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E1", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E2", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E1", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);
      NPCreduceStamina("E2", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);


      // 7
      moveAgentDirection("A", "up", term_num * term_length + Math.floor(Math.random() * degree_of_random) + 1);


      // 8


      // 9


      // 10
      



      // Move Scripts
      // moveAgentToPosition("Alice", 0, 1, 500); // Move Alice to (0, 1) after 0.5 seconds
      // moveAgentToPosition("Bob", 2, 0, 1000);
      // moveAgentToPosition("Alex", 3, 4, 1500);
      // moveAgentToPosition("Dora", 4, 2, 2000);

      // Teleport Scripts
      // moveAgentToPosition("Alice", 4, 3, 2500); // Teleport Alice to (0, 1) after 2 seconds

      // moveAgentToPosition("Bob", 3, 0, 3000);
      // moveAgentToPosition("Alex", 3, 5, 3500);

      // // Attack Scripts
      // attackAgent("Dora", "Alice", 4, 3, 4000); // Dora attacks Alice at (4, 3) after 4 seconds

      // // Gather Scripts
      // gatherGold("Bob", 3, 0, 4500); // Bob gathers gold at (3, 0) after 4.5 seconds

      // // Rest
      // rest("Alex", 5000); // Bob rests after 5 seconds

      // // Move Scripts
      // moveNPCToPosition("Elise", 40, 26, 500); // Move Alice to (0, 1) after 0.5 seconds
      // moveNPCToPosition("Frank", 3, 35, 1000);
      // moveNPCToPosition("Will", 32, 18, 1500);
      // moveNPCToPosition("Jason", 30, 12, 2000);
      // moveNPCToPosition("Noah", 7, 9, 2500);
      // moveNPCToPosition("Olivia", 19, 1, 3000);
    }
  }, [gameStarted]);

  const view = (() => {
    if (gameStarted) {
      return (
        <main className="game">
          <div className="leaderboard">
            <div className="title">Leaderboard</div>
            {[...agents]
              .filter((agent) => agent.stamina > 0)
              .sort((a, b) => b.wealth - a.wealth)
              .map((agent) => (
                <div key={agent.name} className="agent">
                  <div className="name">{agent.name}</div>
                  <div className="wealth">{agent.wealth}</div>
                </div>
              ))}
          </div>
          <DraggableCore>
            <TransformWrapper
              options={{
                minScale: 0.01, // Adjust the minimum scale value here
                maxScale: 2,   // Adjust the maximum scale value here
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
                    {agents.map((agent, index) => (
                      agent.stamina > 0 && (
                        <div
                          key={`spirit-agent-${index}`}
                          className="agent"
                          style={{
                            left: gridSize * agent.x,
                            top: gridSize * agent.y,
                          }}
                        >
                          <div className="name">{agent.name}</div>
                          <img src={agent.image} alt={`Agent ${index + 1}`} className="image" />
                          {agent.name.startsWith("A") ? (
                            <div className="stamina-red-container">
                              <div
                                className="stamina-red"
                                style={{
                                  width: `${Math.min(agent.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.min(agent.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                    {npc.map((agent, index) => (
                      agent.stamina > 0 && (
                        <div
                          key={`spirit-agent-${index}`}
                          className="agent"
                          style={{
                            left: gridSize * agent.x,
                            top: gridSize * agent.y,
                          }}
                        >
                          <div className="name">{agent.name}</div>
                          <img src={agent.image} alt={`Agent ${index + 1}`} className="image" />
                          {agent.name.startsWith("A") ? (
                            <div className="stamina-red-container">
                              <div
                                className="stamina-red"
                                style={{
                                  width: `${Math.min(agent.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.min(agent.stamina * 2, 10)}px`,
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
                            <img src={TeleportModule} alt="Teleport" className="teleport-image" />
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
                            <img src={HospitalModule} alt="Hospital" className="hospital-image" />
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
                            <img src={CrystalMineModule} alt="Mine" className="mine-image" />
                          </div>
                        ) : cell === "Mountain" ? (
                          <div
                            key={`spirit-mountain-${i}-${j}`}
                            className="mountain"
                            style={{
                              left: gridSize * j,
                              top: gridSize * i,
                            }}
                          >
                            <img src={MountainModule} alt="Mountain" className="mountain-image" />
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
          <div className="title">Commanders</div>


          <div className="agents">
            {commanders.map((commander, i) => (
              <div className="agent" key={i}>
                <input
                  className="name"
                  placeholder="Agent name"
                  type="text"
                  value={commander.name}
                  onChange={(e) => {
                    const newCommanders = [...commanders];
                    newCommanders[i].name = e.target.value;
                    setCommanders(newCommanders);
                  }}
                />
                <select
                  className="llm"
                  value={commander.model}
                  onChange={(e) => {
                    const newCommanders = [...commanders];
                    newCommanders[i].model = e.target.value;
                    setCommanders(newCommanders);
                  }}
                >
                  <option value="GPT-3.5">GPT-3.5(Default)</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Claude-v1">Claude-v1</option>
                  <option value="GPT-3.5-turbo">GPT-3.5-turbo</option>
                  <option value="Alpaca">Alpaca</option>
                  <option value="Vicuna">Vicuna</option>
                </select>
                <input
                  className="strategy"
                  placeholder="Please write strategy for this agent"
                  type="text"
                  value={commander.strategy}
                  onChange={(e) => {
                    const newCommanders = [...commanders];
                    newCommanders[i].strategy = e.target.value;
                    setCommanders(newCommanders);
                  }}
                /> 
                <br />
                <br />
                {agents
                .filter((agent) => commander.selectedAgents.includes(agent.name)) // Filter agents based on selectedAgents list
                .map((agent, j) =>  (
                <><input
                className="name2"
                placeholder="Agent name"
                type="text"
                value={agent.name}
                onChange={(e) => {
                  const newAgents = [...agents];
                  newAgents[j].name = e.target.value;
                  setCommanders(newAgents);
                }}
              />
                <div className="location">
                    <label>X:</label>
                    <input
                      type="number"
                      value={agent.x}
                      onChange={(e) => {
                        const newAgents = [...agents];
                        newAgents[j].x = +e.target.value;
                        setAgents(newAgents);
                      } } />
                    <label>Y:</label>
                    <input
                      type="number"
                      value={agent.y}
                      onChange={(e) => {
                        const newAgents = [...agents];
                        newAgents[j].y = +e.target.value;
                        setAgents(newAgents);
                      } } />
                  </div></>
                    ))}
                    <button
                    className="remove"
                    onClick={() => {
                      const newAgents = [...agents];
                      newAgents.splice(i, 1);
                      setAgents(newAgents);
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
                setAgents([
                  ...agents,
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
