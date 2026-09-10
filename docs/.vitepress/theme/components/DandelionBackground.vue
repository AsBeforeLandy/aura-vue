<template>
  <canvas ref="canvasRef" class="aura-dandelion" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * 蒲公英飘散背景（参考 aura 首页同款动效，Vue 版重写）
 *
 * 设计要点：
 * - 固定定位铺满视口，pointer-events: none，不拦截交互
 * - 18 颗种子，各自有独立的大小 / 透明度 / 摇曳频率，避免机械感
 * - 滚动时产生"气流"推动种子，滚动停止后惯性衰减
 * - 鼠标近距离排斥，产生可交互的呼吸感
 * - 配色跟随亮/暗主题（紫罗兰色系），与品牌色一致
 * - 尊重 prefers-reduced-motion：偏好减弱动效时只画静态一帧
 */

interface Seed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  rotation: number;
  rotSpeed: number;
  wobblePhase: number;
  wobbleFreq: number;
  scale: number;
  alpha: number;
  swayPhase: number;
  swayAmp: number;
  driftPhase: number;
}

const canvasRef = ref<HTMLCanvasElement>();

let cleanup: (() => void) | undefined;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const SEED_COUNT = 18;
  const seeds: Seed[] = [];
  const mouse = { x: -9999, y: -9999 };
  let raf = 0;
  let time = 0;

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W() * dpr;
    canvas.height = H() * dpr;
    canvas.style.width = `${W()}px`;
    canvas.style.height = `${H()}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  for (let i = 0; i < SEED_COUNT; i++) {
    // 基础速度向左上，形成"随风飘散"的整体方向
    const bvx = -0.12 - Math.random() * 0.28;
    const bvy = -0.08 - Math.random() * 0.22;
    seeds.push({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: bvx,
      vy: bvy,
      baseVx: bvx,
      baseVy: bvy,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.006,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleFreq: 0.003 + Math.random() * 0.008,
      scale: 1.2 + Math.random() * 1.2,
      alpha: 0.3 + Math.random() * 0.35,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.3 + Math.random() * 0.5,
      driftPhase: Math.random() * Math.PI * 2
    });
  }

  /** 当前主题对应的种子颜色（rgb 分量字符串） */
  const seedRgb = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '196, 181, 253' : '140, 90, 230';
  };

  /** 绘制单颗蒲公英种子：种子体 + 细茎 + 伞冠绒球 */
  const drawSeed = (s: Seed, rgb: string) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.scale(s.scale, s.scale);
    ctx.globalAlpha = s.alpha;

    // A. 种子体：小水滴形
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(-2.5, 16, 0, 12);
    ctx.quadraticCurveTo(2.5, 16, 0, 20);
    ctx.fillStyle = `rgba(${rgb}, 0.55)`;
    ctx.fill();

    // B. 细茎：种子体顶端 -> 伞冠中心
    const stemBend = Math.sin(time * 0.7 + s.wobblePhase) * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(stemBend, 4, 0, 0);
    ctx.strokeStyle = `rgba(${rgb}, 0.3)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // C. 伞冠：上半球放射绒丝
    const filamentCount = 20;
    for (let i = 0; i < filamentCount; i++) {
      const spreadAngle = -Math.PI + (i / (filamentCount - 1)) * Math.PI;
      const tremor = Math.sin(time * 1.5 + s.wobblePhase + i * 0.9) * 0.06;
      const angle = spreadAngle + tremor;

      // 中间绒丝更长，两侧略短 —— 形成球状伞形
      const centerFactor =
        1 - Math.abs(i - (filamentCount - 1) / 2) / ((filamentCount - 1) / 2);
      const len = 10 + centerFactor * 8 + Math.sin(i * 2.3) * 2;

      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;

      const bulge = 0.6 + centerFactor * 0.15;
      const cx = Math.cos(angle) * len * bulge + Math.sin(time * 0.5 + i) * 1.2;
      const cy = Math.sin(angle) * len * bulge;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.strokeStyle = `rgba(${rgb}, ${0.15 + centerFactor * 0.12})`;
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // 绒丝末端分叉
      const forkCount = 2 + (i % 2);
      for (let f = 0; f < forkCount; f++) {
        const forkAngle = angle + (f - (forkCount - 1) / 2) * 0.35;
        const forkLen = 2.5 + ((i * 7 + f * 3) % 5) * 0.3;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(forkAngle) * forkLen, ey + Math.sin(forkAngle) * forkLen);
        ctx.strokeStyle = `rgba(${rgb}, 0.12)`;
        ctx.lineWidth = 0.2;
        ctx.stroke();
      }

      // 绒丝尖端柔光点
      ctx.beginPath();
      ctx.arc(ex, ey, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.25)`;
      ctx.fill();
    }

    // D. 伞冠中心聚合光点
    const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
    centerGlow.addColorStop(0, `rgba(${rgb}, 0.5)`);
    centerGlow.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  };

  // 滚动气流：velocity 为瞬时速度，decay 为滚动停止后的惯性残留
  let lastScrollY = window.scrollY;
  let scrollDecay = 0;

  const loop = () => {
    time += 0.016;
    const cw = W();
    const ch = H();
    ctx.clearRect(0, 0, cw, ch);

    const currentScrollY = window.scrollY;
    const rawDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (Math.abs(rawDelta) > 0.5) {
      scrollDecay = rawDelta * 0.8;
    } else {
      scrollDecay *= 0.92;
    }
    const windForce = rawDelta + scrollDecay;

    const rgb = seedRgb();

    // 粒子间连锁效应：相距较近的种子互相传递动能
    if (Math.abs(windForce) > 1) {
      for (let i = 0; i < seeds.length; i++) {
        for (let j = i + 1; j < seeds.length; j++) {
          const dx = seeds[j].x - seeds[i].x;
          const dy = seeds[j].y - seeds[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const chainRadius = 120;
          if (d < chainRadius && d > 0) {
            const influence = ((chainRadius - d) / chainRadius) * 0.15;
            const avgVx = (seeds[i].vx + seeds[j].vx) * 0.5;
            const avgVy = (seeds[i].vy + seeds[j].vy) * 0.5;
            seeds[i].vx += (avgVx - seeds[i].vx) * influence;
            seeds[j].vx += (avgVx - seeds[j].vx) * influence;
            seeds[i].vy += (avgVy - seeds[i].vy) * influence;
            seeds[j].vy += (avgVy - seeds[j].vy) * influence;
          }
        }
      }
    }

    seeds.forEach((s, idx) => {
      // 1. 鼠标排斥（近距离推开）
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const f = (150 - dist) / 150;
        s.vx += (dx / dist) * f;
        s.vy += (dy / dist) * f;
      } else {
        s.vx += (s.baseVx - s.vx) * 0.012;
        s.vy += (s.baseVy - s.vy) * 0.012;
      }

      // 2. 滚动气流：向下滚动时种子向上飘，不同种子有相位延迟
      if (Math.abs(windForce) > 0.5) {
        const delay = Math.sin(idx * 0.8 + time * 3) * 0.3 + 0.7;
        s.vy -= windForce * 0.02 * delay;
        s.vx += Math.sin(time * 2 + idx * 1.3) * Math.abs(windForce) * 0.008;
        s.rotation -= windForce * 0.0015 * delay;
      }

      // 3. 空气阻力
      s.vx *= 0.975;
      s.vy *= 0.975;

      // 4. 水平摇曳
      s.swayPhase += 0.012;
      s.x += s.vx + Math.sin(s.swayPhase) * s.swayAmp * 0.3;

      // 5. 呼吸式浮沉
      s.driftPhase += 0.008;
      s.y += s.vy + Math.sin(s.driftPhase) * 0.15;

      // 6. 自转 + 轻微摆动
      s.rotation += s.rotSpeed + Math.sin(s.wobblePhase) * 0.003;
      s.wobblePhase += s.wobbleFreq;

      // 7. 边缘循环（飘出视口后从对侧回来）
      if (s.y < -40) {
        s.y = ch + 30;
        s.x = Math.random() * cw;
      }
      if (s.x < -40) {
        s.x = cw + 30;
        s.y = Math.random() * ch;
      }
      if (s.x > cw + 40) {
        s.x = -30;
        s.y = Math.random() * ch;
      }
      if (s.y > ch + 40) {
        s.y = -30;
        s.x = Math.random() * cw;
      }

      drawSeed(s, rgb);
    });

    raf = requestAnimationFrame(loop);
  };

  if (reduceMotion) {
    // 偏好减弱动效：只静态渲染一帧，不启动循环
    const rgb = seedRgb();
    seeds.forEach((s) => drawSeed(s, rgb));
  } else {
    loop();
  }

  const onMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  const onLeave = () => {
    mouse.x = -9999;
    mouse.y = -9999;
  };

  window.addEventListener('resize', resize);
  if (!reduceMotion) {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
  }

  // 主题切换后种子配色需要跟随，这里只让每帧读取（seedRgb 已在 loop 内调用），
  // 因此无需监听主题变化；但 reduced-motion 静态帧需在主题切换时重绘
  const themeObserver = new MutationObserver(() => {
    if (reduceMotion) {
      ctx.clearRect(0, 0, W(), H());
      const rgb = seedRgb();
      seeds.forEach((s) => drawSeed(s, rgb));
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseleave', onLeave);
    themeObserver.disconnect();
  };
});

onBeforeUnmount(() => cleanup?.());
</script>

<style scoped>
.aura-dandelion {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}
</style>
