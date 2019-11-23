
<template>
  <div>
    <h3>A custom button style...</h3>
    <div class="example-container">
      <kup-checkbox :checked.prop="customButtonStyle" @kupCheckboxChange="onCustomButtonStyle" />
    </div>

    <h3>A custom theme...</h3>
    <div class="example-container">
      <kup-checkbox :checked.prop="customTheme" @kupCheckboxChange="onCustomTheme" />
    </div>

    <mwc-theme :theme.prop="themeChosen">
      <mwc-button :theme.prop="themeChosen">Default</mwc-button>
      <mwc-button
        :theme.prop="themeChosen"
        raised="true"
        color="secondary"
        :cstyle.prop="buttonStyleChosen"
      >Primary</mwc-button>
      <mwc-button :theme.prop="themeChosen" raised="true" fab="true">S</mwc-button>
      <mwc-button :theme.prop="themeChosen" raised="true" color="primary" mini="true" fab="true">s</mwc-button>
      <mwc-button :theme.prop="themeChosen" color="secondary">Secondary</mwc-button>
      <mwc-button :theme.prop="themeChosen" disabled="true">Disabled</mwc-button>
      <mwc-button :theme.prop="themeChosen" dense="true">Dense</mwc-button>
    </mwc-theme>
  </div>
</template>


<script>
import themeA from '@/mock/muiThemeA.json';
import themeB from '@/mock/muiThemeB.json';
const buttonStyleA = {};
const buttonStyleB = {
  root: {
    minHeight: 88,
  },
};

export default {
  data() {
    return {
      customTheme: false,
      customButtonStyle: false,
      themeChosen: themeA,
      buttonStyleChosen: buttonStyleA,
      themeA: { ...themeA },
      themeB: { ...themeB },
    };
  },
  methods: {
    onCustomTheme(e) {
      this.customTheme = e.detail.checked;
      if (this.customTheme) {
        this.themeChosen = themeB;
      } else {
        this.themeChosen = themeA;
      }
    },
    onCustomButtonStyle(e) {
      this.customButtonStyle = e.detail.checked;
      if (this.customButtonStyle) {
        this.buttonStyleChosen = buttonStyleB;
      } else {
        this.buttonStyleChosen = buttonStyleA;
      }
    },
  },
};
</script>