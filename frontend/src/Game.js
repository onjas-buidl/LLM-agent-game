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
import {
  ErrorCode,
  getWindowAI,
  type ChatMessage,
  type WindowAI
} from "window.ai"

import { DraggableCore } from "react-draggable";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


//axios.defaults.baseURL = "http://localhost:8080";

const DEFAULT_AGENTS = [
    {
        name: "Alice",
        model: "GPT-3.5",
        x: 0,
        y: 0,
        stamina: 5,
        wealth: 0,
        strategy: "You only want to attack. You actively move towards Bob and attack it. You do not care anything else! ",
        image: BarbarianIcon,
      },
    {
      name: "Bob",
      model: "Alpaca",
      x: 1,
      y: 0,
      stamina: 5,
      wealth: 0,
      strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
      image: NPCBarbarianIcon,
    },
    {
      name: "Alex",
      model: "GPT-4",
      x: 3,
      y: 3,
      stamina: 5,
      wealth: 0,
      strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
      image: CavalryIcon,
    },
    {
      name: "Dora",
      model: "Vicuna",
      x: 4,
      y: 1,
      stamina: 5,
      wealth: 0,
      strategy: "You only want to attack. You actively move towards Alice and attack it. You do not care anything else!",
      image: NPCCavalryIcon,
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

const DEFAULT_NPC = [
  {name: "Elise", x: 40, y: 25, stamina: 5, wealth: 0, image: NPCBarbarianIcon},
  { name: "Frank", x: 2, y: 35, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  { name: "Grace", x: 45, y: 12, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Henry", x: 30, y: 25, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Ivy", x: 14, y: 6, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Jack", x: 23, y: 19, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Kate", x: 32, y: 9, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Liam", x: 42, y: 16, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Mia", x: 7, y: 39, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  { name: "Noah", x: 21, y: 30, stamina: 5, wealth: 0, image: NPCBarbarianIcon },
  { name: "Olivia", x: 37, y: 22, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Parker", x: 13, y: 17, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Quinn", x: 29, y: 8, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Ryan", x: 4, y: 33, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Sophia", x: 27, y: 14, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Thomas", x: 38, y: 26, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Uma", x: 11, y: 37, stamina: 5, wealth: 0, image: BarbarianIcon },
  { name: "Vincent", x: 25, y: 28, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Willow", x: 35, y: 20, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Xavier", x: 9, y: 11, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Yvonne", x: 24, y: 2, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Zachary", x: 34, y: 13, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Ava", x: 8, y: 24, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Benjamin", x: 28, y: 15, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  { name: "Charlotte", x: 3, y: 36, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Daniel", x: 22, y: 27, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Emma", x: 36, y: 19, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Felix", x: 10, y: 10, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Grace", x: 26, y: 1, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  { name: "Henry", x: 39, y: 12, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Yan", x: 12, y: 23, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  { name: "Jack", x: 31, y: 14, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Kate", x: 5, y: 35, stamina: 5, wealth: 0, image: NPCCavalryIcon },
  { name: "Liam", x: 20, y: 26, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Will", x: 33, y: 18, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Noah", x: 6, y: 9, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Olivia", x: 19, y: 0, stamina: 5, wealth: 0, image: CavalryIcon },
  { name: "Jason", x: 30, y: 11, stamina: 5, wealth: 0, image: CavalryIcon },
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
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [npc, setNPC] = useState(DEFAULT_NPC);

  const handleStartGame = async () => {
    setMessage("Starting the game ...");
    setAgents([]);
    setMessage("Successfully started the game!");
    // Initialize worldState map
    setWorldState(
      [
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', ''],
        ['W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', 'W'],
        ['', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W'],
        ['', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Teleport', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', ''],
        ['', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['S', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hospital', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Teleport', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', '', '', 'W', ''],
      ]
    );

    setTimeout(() => setGameStarted(true), 1000);
    setTimeout(() => setMessage(null), 1000);

    setAgents(DEFAULT_AGENTS);
   };

  // Demo Script Functions
   const moveAgentToPosition = (agentName, targetX, targetY, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.name === agentName ? { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1} : agent
        )
      );
    }, delay);
  };

  const moveNPCToPosition = (agentName, targetX, targetY, delay) => {
    setTimeout(() => {
      setNPC((prevAgents) =>
        prevAgents.map((npc) =>
          npc.name === agentName ? { ...npc, x: targetX, y: targetY, stamina: npc.stamina - 1} : npc
        )
      );
    }, delay);
  };

  const attackAgent = (attackerName, defenderName, targetX, targetY, delay) => {
    setTimeout(() => {
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.name === defenderName) {
            return { ...agent, stamina:0 };
          } else if (agent.name === attackerName) {
            return { ...agent, x: targetX, y: targetY, stamina: agent.stamina - 1};
          } else {
            return agent;
          }
        })
      );
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
      // Move Scripts
      moveAgentToPosition("Alice", 0, 1, 500); // Move Alice to (0, 1) after 0.5 seconds
      moveAgentToPosition("Bob", 2, 0, 1000);
      moveAgentToPosition("Alex", 3, 4, 1500);
      moveAgentToPosition("Dora", 4, 2, 2000);

      // Teleport Scripts
      moveAgentToPosition("Alice", 4, 3, 2500); // Teleport Alice to (0, 1) after 2 seconds

      moveAgentToPosition("Bob", 3, 0, 3000);
      moveAgentToPosition("Alex", 3, 5, 3500);

      // Attack Scripts
      attackAgent("Dora", "Alice", 4, 3, 4000); // Dora attacks Alice at (4, 3) after 4 seconds

      // Gather Scripts
      gatherGold("Bob", 3, 0, 4500); // Bob gathers gold at (3, 0) after 4.5 seconds

      // Rest
      rest("Alex", 5000); // Bob rests after 5 seconds

      // Move Scripts
      moveNPCToPosition("Elise", 40, 26, 500); // Move Alice to (0, 1) after 0.5 seconds
      moveNPCToPosition("Frank", 3, 35, 1000);
      moveNPCToPosition("Will", 32, 18, 1500);
      moveNPCToPosition("Jason", 30, 12, 2000);
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
                                  width: `${Math.max(agent.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.max(agent.stamina * 2, 10)}px`,
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
                                  width: `${Math.max(agent.stamina * 2, 10)}px`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="stamina-blue-container">
                              <div
                                className="stamina-blue"
                                style={{
                                  width: `${Math.max(agent.stamina * 2, 10)}px`,
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
                <select
                  className="llm"
                  value={agent.model}
                  onChange={(e) => {
                    const newAgents = [...agents];
                    newAgents[i].model = e.target.value;
                    setAgents(newAgents);
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
