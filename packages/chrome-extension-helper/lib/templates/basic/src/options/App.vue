<template>
  <div>
    <div id="buttonDiv">
      <button v-for="item in kButtonColors" :key="item" :style="{ backgroundColor: item }" @click="changeColor(item)">
        {{ item }}
      </button>
    </div>
    <div>
      <p>Choose a different background color!</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      kButtonColors: ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1']
    };
  },
  methods: {
    changeColor(item) {
      chrome.storage.sync.set({ color: item }, () => {
        console.log(`color is ${item}`);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
button {
  height: 30px;
  width: 30px;
  outline: none;
  margin: 10px;
}
</style>
