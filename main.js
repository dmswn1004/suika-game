import { Engine, Render, Runner, World, Bodies, Body, Events } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F6AE",
    width: 620,
    height: 850,
  },
});

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
let num_success = 0;

// 과일 생성
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    // 준비 상태
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    // 과일 탄성 : 0 ~ 1
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    // 왼쪽으로 이동
    case "KeyA":
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    // 오른쪽으로 이동
    case "KeyD":
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius < 550)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    // 과일 떨어뜨리기
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
};

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
};

// 과일 충돌 감지
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    // 과일 충돌 확인
    if (FRUITS[collision.bodyA.index] && FRUITS[collision.bodyB.index]) {
      // 같은 과일일 경우
      if (collision.bodyA.index == collision.bodyB.index) {
        const index = collision.bodyA.index;

        // 수박일 경우
        if (index == FRUITS.length - 1) {
          num_success += 1;
          return;
        }

        World.remove(world, [collision.bodyA, collision.bodyB]);

        const newFruit = FRUITS[index + 1];

        const newBody = Bodies.circle(
          collision.collision.supports[0].x,
          collision.collision.supports[0].y,
          newFruit.radius,
          {
            render: {
              sprite: { texture: `${newFruit.name}.png` },
            },
            index: index + 1,
          }
        );

        World.add(world, newBody);
      }
    }

    // 패배 조건
    if (!disableAction && (collision.bodyA.name == "topLine" || collision.bodyB.name == "topLine")) {
      alert("패배하였습니다.");
    }

    // 승리 조건
    if (num_success == 2) {
      alert("승리하였습니다.");
    }
  });
});

addFruit();
