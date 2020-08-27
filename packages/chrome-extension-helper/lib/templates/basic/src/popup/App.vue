<template>
  <button @click="changeColor" :style="{ backgroundColor: backgroundColor }" ref="btn">changeColor</button>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      backgroundColor: 'blue'
    };
  },
  mounted() {
    // This code grabs the button from popup.html and requests the color value from storage.
    // It then applies the color as the background of the button.
    chrome.storage.sync.get('color', ({ color }) => {
      this.backgroundColor = color;
      this.$refs.btn.value = color;
    });
  },
  methods: {
    changeColor({ target }) {
      const color = target.value;
      // permission: "activeTab"
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.executeScript(tabs[0].id, {
          code: `document.body.style.backgroundColor = "${color}";`
        });
      });
    }
  }
};
</script>

<style lang="scss" module></style>
