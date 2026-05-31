(function() {
          const canvas = document.getElementById('interactionCanvas');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 1;

          const style = document.createElement('style');
          style.innerHTML = `
              .intro-header, #hero-container { height: 250px !important; margin: 0 !important; padding: 0 !important; }
              #interactionCanvas { display: block; width: 100%; height: 250px; background: #000; vertical-align: bottom; cursor: pointer; }
          `;
          document.head.appendChild(style);

          const config = {
              getTargetCount: () => {
                  const w = window.innerWidth;
                  if (w < 480) return 40;
                  if (w < 768) return 80;
                  if (w < 1024) return 120;
                  return 160;
              },
              boxColors: ['#f87171', '#fbbf24', '#3b82f6', '#4ade80'],
              morphSpeed: 0.05,
              chaosSpeed: 0.05,
              yShift: 28,
              sizeBalance: [1.2, 1.0, 1.0, 1.2],
              glowStrength: 15,
              jitterStrength: 2.0,
              linkDist: 60,
              linkAlpha: 0.6,
              hoverDelay: 1000,
              hoverOutDelay: 2000,
              releaseTimeout: 2000
          };

          let fields = [];
          const mouse = { hoverId: null, pendingId: null, lockedId: null, hoverTimer: null, hoverOutTimer: null, releaseTimer: null };

          function clearAllTimers() {
              clearTimeout(mouse.hoverTimer);
              clearTimeout(mouse.hoverOutTimer);
              clearTimeout(mouse.releaseTimer);
              mouse.hoverTimer = null;
              mouse.hoverOutTimer = null;
              mouse.releaseTimer = null;
          }

          function getShapeForField(fieldId, count, boxW, boxH) {
              let points = [];
              for(let i=0; i<count; i++) {
                  let t = i / count;
                  if (fieldId === 0) { // GUITAR
                      if(t < 0.3) points.push({x: 0, y: -70 + t * 250});
                      else { let a = (t-0.3)*Math.PI*2; let r = 40*(1+0.4*Math.abs(Math.sin(a))); points.push({x: Math.cos(a)*r, y: 25+Math.sin(a)*50}); }
                  } else if (fieldId === 1) { // PIANO
                      if(t < 0.3) points.push({x: -45 + t*300, y: 35});
                      else { let a = (t-0.3)*Math.PI; points.push({x: 50 - Math.pow(a/Math.PI, 0.6)*100, y: 35 - Math.sin(a) * 75}); }
                  } else if (fieldId === 2) { // DRUMS
                      if(t < 0.5) { let a = (t*2)*Math.PI*2; points.push({x: Math.cos(a)*40, y: 30 + Math.sin(a)*35}); }
                      else { let side = i % 2 === 0 ? -1 : 1; points.push({x: side * 50 + (Math.random()-0.5)*20, y: -25}); }
                  } else { // MIC
                      if(t < 0.5) { let a = (t*2)*Math.PI*2; points.push({x: Math.cos(a)*20, y: -35 + Math.sin(a)*30}); }
                      else points.push({x: (Math.random()-0.5)*5, y: -5 + (t-0.5)*110});
                  }
              }
              let minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
              let minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
              let scale = (130 / (maxY - minY)) * config.sizeBalance[fieldId];
              let centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
              return points.map(p => ({ x: (p.x - centerX) * scale, y: (p.y - centerY) * scale }));
          }

          class Particle {
              constructor(field, index, startInForm = false) {
                  this.field = field; this.index = index;
                  const target = this.field.shape[this.index] || {x: 0, y: 0};
                  if(startInForm) {
                      this.x = this.field.x + this.field.w/2 + target.x;
                      this.y = 125 + target.y + config.yShift;
                  } else {
                      this.x = Math.random() * field.w + field.x;
                      this.y = Math.random() * 250;
                  }
                  this.vx = (Math.random()-0.5)*2; this.vy = (Math.random()-0.5)*2;
                  this.size = Math.random()*1.5 + 1.2;
              }
              update() {
                  const isActive = (mouse.hoverId === this.field.id || mouse.lockedId === this.field.id);
                  if (isActive) {
                      const target = this.field.shape[this.index];
                      if(!target) return;
                      const jX = (Math.random() - 0.5) * config.jitterStrength;
                      const jY = (Math.random() - 0.5) * config.jitterStrength;
                      const tx = this.field.x + this.field.w/2 + target.x + jX;
                      const ty = 125 + target.y + config.yShift + jY;
                      this.vx = (tx - this.x) * config.morphSpeed + jX * 0.5;
                      this.vy = (ty - this.y) * config.morphSpeed + jY * 0.5;
                      this.x += this.vx; this.y += this.vy;
                  } else {
                      this.vx += (Math.random()-0.5) * config.chaosSpeed;
                      this.vy += (Math.random()-0.5) * config.chaosSpeed;
                      this.x += this.vx; this.y += this.vy;
                      this.vx *= 0.98; this.vy *= 0.98;
                  }
                  const p = 5;
                  if (this.x < this.field.x + p) { this.x = this.field.x + p; this.vx *= -1; }
                  else if (this.x > this.field.x + this.field.w - p) { this.x = this.field.x + this.field.w - p; this.vx *= -1; }
                  if (this.y < p) { this.y = p; this.vy *= -1; }
                  else if (this.y > 245) { this.y = 245; this.vy *= -1; }
              }
              draw(color, active) {
                  ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                  if (active) {
                      ctx.globalAlpha = 1.0;
                      ctx.shadowBlur = config.glowStrength * dpr; ctx.shadowColor = color;
                  } else {
                      ctx.globalAlpha = 0.75; ctx.shadowBlur = 0;
                  }
                  ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
              }
          }

          function initFields() {
              const oldWidth = canvas.width / dpr || window.innerWidth;
              const logicalWidth = window.innerWidth;
              const logicalHeight = 250;
              canvas.width = logicalWidth * dpr;
              canvas.height = logicalHeight * dpr;
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.scale(dpr, dpr);
              const cellW = logicalWidth / 4;
              const oldCellW = oldWidth / 4;
              const targetCount = config.getTargetCount();
              for (let i = 0; i < 4; i++) {
                  if (fields[i]) {
                      const ratio = cellW / oldCellW;
                      fields[i].particles.forEach(p => { p.x = (i * cellW) + ((p.x - fields[i].x) * ratio); });
                      fields[i].x = i * cellW; fields[i].w = cellW;
                      fields[i].shape = getShapeForField(i, targetCount, cellW, 250);
                      let currentParticles = fields[i].particles;
                      if (currentParticles.length < targetCount) {
                          for (let j = currentParticles.length; j < targetCount; j++) {
                              currentParticles.push(new Particle(fields[i], j, false));
                          }
                      } else if (currentParticles.length > targetCount) {
                          currentParticles.length = targetCount;
                      }
                  } else {
                      let f = { id: i, x: i * cellW, y: 0, w: cellW, h: 250, particles: [] };
                      f.shape = getShapeForField(i, targetCount, f.w, f.h);
                      for (let j = 0; j < targetCount; j++) f.particles.push(new Particle(f, j, true));
                      fields.push(f);
                  }
              }
          }

          function drawFieldLinks(field) {
              const particles = field.particles;
              const maxDistSq = config.linkDist * config.linkDist;
              ctx.lineWidth = 1.0; ctx.strokeStyle = config.boxColors[field.id];
              for (let i = 0; i < particles.length; i++) {
                  const p1 = particles[i];
                  for (let j = i + 1; j < particles.length; j++) {
                      const p2 = particles[j];
                      const dx = p1.x - p2.x, dy = p1.y - p2.y;
                      const d2 = dx * dx + dy * dy;
                      if (d2 < maxDistSq) {
                          ctx.globalAlpha = config.linkAlpha * (1 - Math.sqrt(d2) / config.linkDist);
                          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                      }
                  }
              }
          }

          canvas.addEventListener('mousemove', (e) => {
              const rect = canvas.getBoundingClientRect();
              const mx = e.clientX - rect.left;
              let currentId = null;
              for (let i = 0; i < 4; i++) { if (mx > fields[i].x && mx < fields[i].x + fields[i].w) { currentId = i; break; } }

              if (currentId !== null) {
                  if (mouse.pendingId !== currentId) {
                      clearAllTimers();
                      mouse.pendingId = currentId;
                      mouse.hoverTimer = setTimeout(() => { mouse.hoverId = mouse.pendingId; }, config.hoverDelay);
                  }
              } else {

                  if (mouse.pendingId !== null || mouse.hoverId !== null) {
                      clearTimeout(mouse.hoverTimer);
                      mouse.pendingId = null;
                      if (mouse.hoverId !== null && !mouse.hoverOutTimer) {
                          mouse.hoverOutTimer = setTimeout(() => {
                              mouse.hoverId = null;
                              mouse.hoverOutTimer = null;
                          }, config.hoverOutDelay);
                      }
                  }
              }
          });

          canvas.addEventListener('mousedown', (e) => {
              const rect = canvas.getBoundingClientRect();
              const mx = e.clientX - rect.left;
              clearAllTimers();
              for (let i = 0; i < 4; i++) {
                  if (mx > fields[i].x && mx < fields[i].x + fields[i].w) {
                      mouse.lockedId = i;
                      break;
                  }
              }
          });

          window.addEventListener('mouseup', () => {
              if (mouse.lockedId !== null) {
                  clearTimeout(mouse.releaseTimer);
                  mouse.releaseTimer = setTimeout(() => {
                      mouse.lockedId = null;
                  }, config.releaseTimeout);
              }
          });

          canvas.addEventListener('mouseleave', () => {
              if (mouse.hoverId !== null && !mouse.hoverOutTimer) {
                  mouse.hoverOutTimer = setTimeout(() => {
                      mouse.hoverId = null;
                      mouse.hoverOutTimer = null;
                  }, config.hoverOutDelay);
              }
              mouse.pendingId = null;
          });

          const canvasObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      if (!canvas.dataset.animating) {
                          canvas.dataset.animating = "true";
                          animate();
                      }
                  } else {
                      canvas.dataset.animating = "";
                  }
              });
          }, { threshold: 0.05 });

          canvasObserver.observe(canvas);

          function animate() {

              if (!canvas.dataset.animating) return;

              ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
              for (let i = 0; i < 4; i++) {
                  const f = fields[i];
                  const active = (mouse.hoverId === f.id || mouse.lockedId === f.id);
                  drawFieldLinks(f);
                  f.particles.forEach(p => { p.update(); p.draw(config.boxColors[f.id], active); });
              }
              requestAnimationFrame(animate);
          }

          window.addEventListener('resize', initFields);
          initFields(); animate();
      })();
