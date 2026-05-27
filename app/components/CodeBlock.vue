<script setup lang="ts">
const props = defineProps<{ code: string }>()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="code-block rounded-lg">
    <div class="code-block__bar">
      <span class="code-block__dot code-block__dot--red" />
      <span class="code-block__dot code-block__dot--amber" />
      <span class="code-block__dot code-block__dot--green" />
      <v-spacer />
      <v-btn
        size="x-small"
        variant="text"
        color="white"
        class="code-block__copy"
        @click="copy"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </v-btn>
    </div>
    <pre class="code-block__pre"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: #0B1722;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(11, 23, 34, 0.25);
}
.code-block__bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.code-block__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.code-block__dot--red { background: #EF5350; }
.code-block__dot--amber { background: #FFCA28; }
.code-block__dot--green { background: #66BB6A; }
.code-block__copy {
  letter-spacing: 0.04em;
}
.code-block__pre {
  margin: 0;
  padding: 16px;
  color: #E3F2FD;
  font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-x: auto;
}
</style>
