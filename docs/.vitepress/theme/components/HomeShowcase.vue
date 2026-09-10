<template>
  <section class="aura-showcase">
    <div class="aura-showcase-inner">
      <header class="aura-showcase-head">
        <h2>开箱即用的交互</h2>
        <p>下面全部是真实运行中的组件，不是截图——直接点一下试试。</p>
      </header>

      <div class="aura-showcase-grid">
        <!-- 按钮 -->
        <article class="aura-card">
          <div class="aura-card-head">
            <h3>Button</h3>
            <a class="aura-card-link" href="./components/button">查看文档 →</a>
          </div>
          <div class="aura-card-body">
            <Button>默认</Button>
            <Button type="primary">主要</Button>
            <Button type="dashed">虚线</Button>
            <Button type="text">文本</Button>
          </div>
        </article>

        <!-- 输入与开关 -->
        <article class="aura-card">
          <div class="aura-card-head">
            <h3>Input / Switch</h3>
            <a class="aura-card-link" href="./components/input">查看文档 →</a>
          </div>
          <div class="aura-card-body aura-card-body-col">
            <Input v-model="keyword" placeholder="试试输入中文" clearable />
            <label class="aura-inline">
              <span>仅看我的任务</span>
              <Switch v-model="onlyMine" />
            </label>
          </div>
        </article>

        <!-- 选择器 -->
        <article class="aura-card">
          <div class="aura-card-head">
            <h3>Select</h3>
            <a class="aura-card-link" href="./components/select">查看文档 →</a>
          </div>
          <div class="aura-card-body aura-card-body-col">
            <Select v-model="city" placeholder="请选择城市" :options="cities" />
            <span class="aura-hint">支持键盘 ↑ ↓ 导航、Esc 关闭</span>
          </div>
        </article>

        <!-- 弹窗 -->
        <article class="aura-card">
          <div class="aura-card-head">
            <h3>Modal</h3>
            <a class="aura-card-link" href="./components/modal">查看文档 →</a>
          </div>
          <div class="aura-card-body aura-card-body-col">
            <Button type="primary" @click="dialogOpen = true">打开对话框</Button>
            <span class="aura-hint">遮罩 / Esc / × 均可关闭</span>
          </div>
        </article>
      </div>

      <div class="aura-showcase-foot">
        <span class="aura-stat"><b>{{ componentCount }}</b> 个组件</span>
        <span class="aura-dot" aria-hidden="true">·</span>
        <span class="aura-stat"><b>{{ testCount }}</b> 条单元测试</span>
        <span class="aura-dot" aria-hidden="true">·</span>
        <span class="aura-stat">v<b>0.1.0</b></span>
      </div>
    </div>

    <Modal v-model="dialogOpen" title="这是一个对话框">
      <p>对话框通过 Teleport 渲染到 body，不受父级 overflow 裁剪。</p>
      <p class="aura-hint">按 Esc、点遮罩或右上角 × 都可以关闭。</p>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Switch, Select, Modal } from '@aura/components';

const keyword = ref('');
const onlyMine = ref(true);
const city = ref('');
const dialogOpen = ref(false);

const cities = [
  { label: '杭州', value: 'hangzhou' },
  { label: '上海', value: 'shanghai' },
  { label: '深圳（暂不可选）', value: 'shenzhen', disabled: true }
];

const componentCount = 6;
const testCount = 52;
</script>

<style scoped>
.aura-showcase {
  padding: 8px 24px 72px;
}

.aura-showcase-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.aura-showcase-head {
  text-align: center;
  margin-bottom: 36px;
}

.aura-showcase-head h2 {
  margin: 0 0 8px;
  border: none;
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.aura-showcase-head p {
  margin: 0;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.aura-showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.aura-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.aura-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.aura-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.aura-card-head h3 {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--vp-c-brand-1);
}

.aura-card-link {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.aura-card-link:hover {
  color: var(--vp-c-brand-1);
}

.aura-card-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  min-height: 96px;
}

.aura-card-body-col {
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.aura-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.aura-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.aura-showcase-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.aura-stat b {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.aura-dot {
  color: var(--vp-c-divider);
}

@media (max-width: 768px) {
  .aura-showcase-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .aura-showcase {
    padding: 8px 16px 56px;
  }
}
</style>
