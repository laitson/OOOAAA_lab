document.addEventListener("DOMContentLoaded", function () {
  // метаболы
  function initMetaballsBlock() {
    const canvas = document.getElementById("metaballsCanvas");
    if (!canvas) {
      console.error(
        "Canvas для метаболов не найден! Проверь id='metaballsCanvas'",
      );
      return;
    }

    const container = canvas.parentElement;
    const ctx = canvas.getContext("2d");

    // Цвета
    const BG_COLOR = { r: 35, g: 33, b: 33 };
    const BALL_COLOR = { r: 18, g: 17, b: 17 };

    class Ball {
      constructor(effect, x, y) {
        this.effect = effect;
        this.x = x || Math.random() * this.effect.width;
        this.y = y || Math.random() * this.effect.height;
        this.radius = Math.random() * 60 + 30;
        this.speedX = (Math.random() - 0.5) * 2; 
        this.speedY = (Math.random() - 0.5) * 2;
      }
      update() {
        if (this.x - this.radius < 0) {
          this.x = this.radius;
          this.speedX = -this.speedX;
        }
        if (this.x + this.radius > this.effect.width) {
          this.x = this.effect.width - this.radius;
          this.speedX = -this.speedX;
        }
        if (this.y - this.radius < 0) {
          this.y = this.radius;
          this.speedY = -this.speedY;
        }
        if (this.y + this.radius > this.effect.height) {
          this.y = this.effect.height - this.radius;
          this.speedY = -this.speedY;
        }

        this.x += this.speedX;
        this.y += this.speedY;
      }
    }

    class MetaballsEffect {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.balls = [];
      }

      init(numberOfBalls) {
        for (let i = 0; i < numberOfBalls; i++) {
          this.balls.push(new Ball(this));
        }
      }

      update() {
        this.balls.forEach((ball) => ball.update());
      }

      draw(context) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = BG_COLOR.r;
          data[i + 1] = BG_COLOR.g;
          data[i + 2] = BG_COLOR.b;
          data[i + 3] = 255;
        }

        const step = 1;

        for (let y = 0; y < this.height; y += step) {
          for (let x = 0; x < this.width; x += step) {
            let sum = 0;
            for (let ball of this.balls) {
              const dx = x - ball.x;
              const dy = y - ball.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              sum += (ball.radius * ball.radius) / (distance * distance + 0.1);
            }

            if (sum > 0.55) {
              for (let dy = 0; dy < step; dy++) {
                for (let dx = 0; dx < step; dx++) {
                  const px = x + dx;
                  const py = y + dy;
                  if (px < this.width && py < this.height) {
                    const index = (py * this.width + px) * 4;
                    data[index] = BALL_COLOR.r;
                    data[index + 1] = BALL_COLOR.g;
                    data[index + 2] = BALL_COLOR.b;
                    data[index + 3] = 255;
                  }
                }
              }
            }
          }
        }

        context.putImageData(imageData, 0, 0);
      }

      addBall(x, y) {
        const newBall = new Ball(this, x, y);
        newBall.radius = Math.random() * 35 + 15;
        newBall.speedX = (Math.random() - 0.5) * 2;
        newBall.speedY = (Math.random() - 0.5) * 2;
        this.balls.push(newBall);
      }

      removeBall() {
        if (this.balls.length > 1) {
          this.balls.pop();
        }
      }

      resize(width, height) {
        this.width = width;
        this.height = height;
      }
    }

    // Функция изменения размера
    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (effect) effect.resize(canvas.width, canvas.height);
    }

    const effect = new MetaballsEffect(canvas.width, canvas.height);
    effect.init(8);

    // анимация
    function animate() {
      if (!canvas.isConnected) return;
      effect.update();
      effect.draw(ctx);
      requestAnimationFrame(animate);
    }

    // инициализация
    resizeCanvas();
    animate();

    // интерактивность
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closestBall = null;
      let closestDistance = Infinity;

      for (let ball of effect.balls) {
        const dx = ball.x - mouseX;
        const dy = ball.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestBall = ball;
        }
      }

      if (closestBall && closestDistance < 100) {
        const dx = mouseX - closestBall.x;
        const dy = mouseY - closestBall.y;
        closestBall.speedX += dx * 0.03;
        closestBall.speedY += dy * 0.03;

        const maxSpeed = 4;
        closestBall.speedX = Math.min(
          maxSpeed,
          Math.max(-maxSpeed, closestBall.speedX),
        );
        closestBall.speedY = Math.min(
          maxSpeed,
          Math.max(-maxSpeed, closestBall.speedY),
        );
      }
    });

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      effect.addBall(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      effect.removeBall();
    });

    window.addEventListener("resize", () => resizeCanvas());

    console.log("Metaballs блок запущен");
  }

  // запуск метаболов
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initMetaballsBlock, 200);
    });
  } else {
    setTimeout(initMetaballsBlock, 200);
  }
});
