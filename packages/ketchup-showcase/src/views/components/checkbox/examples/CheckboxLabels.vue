<template>
  <div>
    <div class="demo-wrapper">
      <p>
        Checkboxes can be rendered with a label on their left or on their right. You can choose between setting a
        <span
          class="code-word"
        >labelleft</span> or a
        <span class="code-word">labelright</span> attribute, which are mutually exclusive.
      </p>
      <div class="demo-container">
        <div class="kup-container">
          <kup-checkbox labelleft="This label is on the left"></kup-checkbox>
          <kup-checkbox labelright="This label is on the right"></kup-checkbox>
        </div>
        <p class="centered">Left aligned sample markup</p>
        <code class="flat">{{markupLeft}}</code>
        <p class="centered">Right aligned sample markup</p>
        <code class="flat">{{markupRight}}</code>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckboxLabels',
  data() {
    return {
      markupLeft: '<kup-checkbox labelleft="Your label"></kup-checkbox>',
      markupRight: '<kup-checkbox labelright="Your label"></kup-checkbox>',
    };
  },
};
</script>