// --- CONFIGURAÇÕES E ESTADOS ---
let tela = "MENU"; // MENU, JOGO, SOBRE, GAMEOVER
let jogador;
let inimigos = [];
let lasers = [];
let particulas = [];
let score = 0;
let vidas = 10;
let fase = 1;
let faseMostrar = 0;
let contagemFase = 0;

// PALETA DE CORES DOS INIMIGOS (Muda a cada fase)
// Fase 1: Amarelo, Fase 2: Laranja, Fase 3: Roxo, Fase 4: Azul, Fase 5: Verde
let coresFases = ["#ffff00", "#ff6600", "#9900ff", "#0066ff", "#00ff00"];

// Variáveis de Áudio
let somLaser;
let somExplosao;

// O preload garante que a página carregue os arquivos de som antes de iniciar o game loop
function preload() {
  soundFormats('mp3', 'wav');
  somLaser = loadSound('assets/laser.wav'); 
  somExplosao = loadSound('assets/explosao.wav'); 
}

function setup() {
  let canvas = createCanvas(800, 600);
  
  // Força o canvas a receber o foco do teclado assim que carrega
  canvas.elt.tabIndex = 1;
  canvas.elt.focus();
  
  jogador = new Jogador();
}

function draw() {
  background(10, 10, 20); // Fundo espacial escuro

  if (tela === "MENU") {
    desenharMenu();
  } else if (tela === "SOBRE") {
    desenharSobre();
  } else if (tela === "JOGO") {
    executarJogo();
  } else if (tela === "GAMEOVER") {
    desenharGameOver();
  }
}

// --- CONTROLES INTERATIVOS ---
function mousePressed() {
  if (tela === "JOGO" && vidas > 0) {
    jogador.atirar();
  }
}

function keyPressed() {
  if (tela === "MENU") {
    if (key === '1' || keyCode === 97) {
      reiniciarJogo();
      tela = "JOGO";
    }
    if (key === '2' || keyCode === 98) {
      tela = "SOBRE";
    }
  } else if (tela === "SOBRE" || tela === "GAMEOVER") {
    if (keyCode === ESCAPE) {
      tela = "MENU";
    }
  }
}

function reiniciarJogo() {
  score = 0;
  vidas = 10;
  fase = 1;
  faseMostrar = 0;
  contagemFase = 0;
  jogador = new Jogador();
  inimigos = [];
  lasers = [];
  particulas = [];
}

// --- EFEITO VISUAL NEON ---
function aplicarNeon(cor, brilho) {
  drawingContext.shadowBlur = brilho;
  drawingContext.shadowColor = cor;
  stroke(cor);
  fill(cor);
}

function resetarNeon() {
  drawingContext.shadowBlur = 0;
}

// --- TELAS DO MENU E PROGRESSÃO ---
function desenharMenu() {
  textAlign(CENTER, CENTER);

  aplicarNeon("#00ffcc", 20);
  textSize(52);
  text("CYBER STRIKE", width / 2, height / 2 - 80);

  aplicarNeon("#ff007f", 10);
  textSize(22);
  text("[1] INICIAR JOGO", width / 2, height / 2 - 10);
  text("[2] SOBRE / CRÉDITOS", width / 2, height / 2 + 30);

  resetarNeon();
  fill(200);
  textSize(16);
  text("Use as setas ou A / D para mover a nave", width / 2, height / 2 + 90);
  text("Clique com o mouse para atirar nos inimigos", width / 2, height / 2 + 120);
  text("Pressione [ESC] a qualquer momento para voltar ao menu", width / 2, height - 50);
}

function desenharSobre() {
  textAlign(CENTER, CENTER);
  aplicarNeon("#00ffcc", 15);
  textSize(32);
  text("CRÉDITOS", width / 2, 100);
  
  resetarNeon();
  fill(255);
  textSize(22);
  text("Desenvolvido por:", width / 2, height / 2 - 30);
  textSize(18);
  fill(200);
  text("Douglas Henrique do Prado\n", width / 2, height / 2 + 20);
  
  fill(100);
  text("Pressione [ESC] para voltar", width / 2, height - 50);
}

function desenharGameOver() {
  textAlign(CENTER, CENTER);
  aplicarNeon("#ff0055", 25);
  textSize(50);
  text("GAME OVER", width / 2, height / 2 - 30);
  
  resetarNeon();
  fill(255);
  textSize(22);
  text(`SCORE FINAL: ${score}`, width / 2, height / 2 + 30);
  fill(150);
  text("Pressione [ESC] para voltar ao Menu", width / 2, height / 2 + 70);
}

function desenharHUD() {
  resetarNeon();
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`SCORE: ${score}`, 20, 20);
  text(`VIDAS: ${vidas}`, 20, 45);
  text(`FASE: ${fase}`, 20, 70);
}

function desenharTransicaoFase() {
  textAlign(CENTER, CENTER);
  aplicarNeon("#ffffff", 25);
  textSize(36);
  text(`FASE ${faseMostrar}`, width / 2, height / 2);
  resetarNeon();
  fill(200);
  textSize(18);
  text("Prepare-se para inimigos mais rápidos!", width / 2, height / 2 + 50);
}

// --- DINÂMICA PRINCIPAL DO JOGO ---
function executarJogo() {
  desenharHUD();

  if (faseMostrar > 0) {
    desenharTransicaoFase();
    contagemFase++;
    if (contagemFase > 90) {
      faseMostrar = 0;
      contagemFase = 0;
    }
    return;
  }

  jogador.atualizar();
  jogador.desenhar();

  if (frameCount % max(15, 50 - fase * 5) === 0) {
    inimigos.push(new Inimigo());
  }

  // Lógica dos Lasers
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].atualizar();
    lasers[i].desenhar();
    
    if (lasers[i].foraDaTela()) {
      lasers.splice(i, 1);
      continue;
    }

    // Colisão Laser vs Inimigo
    for (let j = inimigos.length - 1; j >= 0; j--) {
      if (lasers[i] && lasers[i].colideCom(inimigos[j])) {
        
        if (somExplosao && somExplosao.isLoaded()) {
          somExplosao.play();
        }

        // Passa a cor do inimigo destruído para as partículas da explosão
        for (let k = 0; k < 12; k++) {
          particulas.push(new Particula(inimigos[j].pos.x, inimigos[j].pos.y, inimigos[j].cor));
        }
        
        inimigos.splice(j, 1);
        lasers.splice(i, 1);
        score += 10;
        
        if (score % 100 === 0) {
          fase++;
          faseMostrar = fase;
          contagemFase = 0;
        }
        break;
      }
    }
  }

  // Lógica dos Inimigos
  for (let j = inimigos.length - 1; j >= 0; j--) {
    inimigos[j].atualizar();
    inimigos[j].desenhar();

    if (jogador.colideCom(inimigos[j])) {
      vidas--;
      if (somExplosao && somExplosao.isLoaded()) somExplosao.play();
      
      inimigos.splice(j, 1);
      if (vidas <= 0) tela = "GAMEOVER";
      continue;
    }

    if (inimigos[j].pos.y > height) {
      inimigos.splice(j, 1);
      vidas--;
      if (somExplosao && somExplosao.isLoaded()) somExplosao.play();
      if (vidas <= 0) tela = "GAMEOVER";
    }
  }

  // Lógica das Partículas
  for (let p = particulas.length - 1; p >= 0; p--) {
    particulas[p].atualizar();
    particulas[p].desenhar();
    if (particulas[p].vida <= 0) particulas.splice(p, 1);
  }
}

// --- CLASSES (ORIENTAÇÃO A OBJETOS E VETORES) ---

class Jogador {
  constructor() {
    this.pos = createVector(width / 2, height - 60);
    this.vel = createVector(0, 0);
    this.tamanho = 30;
    this.velocidadeMax = 7;
  }

  atualizar() {
    let direcao = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) direcao = -1;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) direcao = 1;
    
    this.vel.x = direcao * this.velocidadeMax;
    this.pos.add(this.vel);
    this.pos.x = constrain(this.pos.x, this.tamanho, width - this.tamanho);
  }

  desenhar() {
    push();
    translate(this.pos.x, this.pos.y);
    
    let mousePos = createVector(mouseX, mouseY);
    let direcaoMira = p5.Vector.sub(mousePos, this.pos);
    let angulo = direcaoMira.heading() + HALF_PI; 
    rotate(angulo);

    aplicarNeon("#00ffcc", 15);
    noFill();
    strokeWeight(3);
    triangle(0, -this.tamanho, -this.tamanho/2, this.tamanho/2, this.tamanho/2, this.tamanho/2);
    pop();
  }

  atirar() {
    lasers.push(new Laser(this.pos.x, this.pos.y, mouseX, mouseY));
    
    if (somLaser && somLaser.isLoaded()) {
      somLaser.play();
    }
  }

  colideCom(inimigo) {
    let d = p5.Vector.dist(this.pos, inimigo.pos);
    return d < (this.tamanho + inimigo.tamanho / 2);
  }
}

class Laser {
  constructor(origemX, origemY, alvoX, alvoY) {
    this.pos = createVector(origemX, origemY);
    let alvo = createVector(alvoX, alvoY);
    
    this.vel = p5.Vector.sub(alvo, this.pos);
    this.vel.setMag(12); 
  }

  atualizar() {
    this.pos.add(this.vel);
  }

  desenhar() {
    push();
    aplicarNeon("#ff007f", 12);
    strokeWeight(4);
    let finalLinha = p5.Vector.add(this.pos, p5.Vector.mult(this.vel, 1.5));
    line(this.pos.x, this.pos.y, finalLinha.x, finalLinha.y);
    pop();
  }

  foraDaTela() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }

  colideCom(inimigo) {
    let d = p5.Vector.dist(this.pos, inimigo.pos);
    return d < (inimigo.tamanho / 2 + 5);
  }
}

class Inimigo {
  constructor() {
    this.pos = createVector(random(30, width - 30), -20);
    this.vel = createVector(random(-1, 1), random(2, 4) + (fase * 0.4));
    this.tamanho = random(20, 40);
    
    // MUDANÇA DE COR: Escolhe a cor baseada no array de cores usando a fase atual
    let indiceCor = (fase - 1) % coresFases.length;
    this.cor = coresFases[indiceCor];
  }

  atualizar() {
    this.pos.add(this.vel);
    if (this.pos.x < this.tamanho/2 || this.pos.x > width - this.tamanho/2) {
      this.vel.x *= -1;
    }
  }

  desenhar() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Aplica a cor dinâmica da fase atual no efeito Neon
    aplicarNeon(this.cor, 10);
    noFill();
    strokeWeight(2);
    
    beginShape();
    vertex(0, -this.tamanho/2);
    vertex(this.tamanho/2, 0);
    vertex(0, this.tamanho/2);
    vertex(-this.tamanho/2, 0);
    endShape(CLOSE);
    pop();
  }
}

class Particula {
  constructor(x, y, corInimigo) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5)); 
    this.vida = 255;
    // Pega a cor do inimigo que explodiu ou escolhe uma aleatória da paleta
    this.cor = random([corInimigo, "#ff007f", "#00ffcc"]);
  }

  atualizar() {
    this.pos.add(this.vel);
    this.vida -= 8; 
  }

  desenhar() {
    push();
    drawingContext.shadowBlur = 5;
    drawingContext.shadowColor = this.cor;
    noStroke();
    let c = color(this.cor);
    c.setAlpha(this.vida);
    fill(c);
    ellipse(this.pos.x, this.pos.y, random(2, 5));
    pop();
  }
}