import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import FRUITS from "./fruits";

const engine = Engine.create();
const render = Render.create({ engine, element: document.body, options: { wireframes: false, background: "#F7F4C8", width: 620, height: 850 } });

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" },
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);
Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_watermelon = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  // const index = 10;
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (e) => {
  if (disableAction) {
    return;
  }

  switch (e.code) {
    case "KeyA":
      if (interval) {
        return;
      }
      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
      break;

    case "KeyD":
      if (interval) {
        return;
      }
      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
        }
      }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 500);
      break;

    default:
      break;
  }
};

window.onkeyup = (e) => {
  switch (e.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
};

Events.on(engine, "collisionStart", (e) => {
  e.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        num_watermelon++;
        if (num_watermelon >= 2) {
          alert("게임 승리!");
          restartGame();
        }
      } else {
        World.remove(world, [collision.bodyA, collision.bodyB]);

        const newFruit = FRUITS[index + 1];

        const newBody = Bodies.circle(collision.collision.supports[0].x, collision.collision.supports[0].y, newFruit.radius, {
          render: { sprite: { texture: `${newFruit.name}.png` } },
          index: index + 1,
        });
        World.add(world, newBody);
      }
    }

    if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game Over");
      restartGame();
    }
  });
});

function restartGame() {
  World.clear(world);

  World.add(world, [leftWall, rightWall, ground, topLine]);
  Render.run(render);
  Runner.run(engine);

  num_watermelon = 0;
}

addFruit();
