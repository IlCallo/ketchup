<template>
  <div>
    <p>In this form, the Field wraps a kup-text-input element.</p>

    <h3>Basic input text</h3>
    <div class="example-container">
      <kup-fld :config.prop="basicInput" />
    </div>

    <h3>With initial value</h3>
    <div class="example-container">
      <kup-fld :config.prop="inputInitialValue" />
    </div>

    <h3>Is clearable</h3>
    <div class="example-container">
      <kup-fld :config.prop="inputIsClearable" />
    </div>

    <h3>With a label</h3>
    <div class="example-container">
      <kup-fld :config.prop="inputWithLabel" />
    </div>

    <h3>Input text max length</h3>
    <div class="example-container">
      <kup-fld :config.prop="inputWithMaxLength" />
      <div>
        <h4>Change input max length</h4>
        <kup-text-input
          :initial-value="fieldMaxLength"
          :max-length="5"
          @ketchupTextInputUpdated="onUpdateMaxLength"
        />
      </div>
    </div>

    <h3>Input text: password form</h3>
    <div class="example-container">
      <kup-fld :config.prop="inputUsePassword" />
    </div>

    <h3>Input text: file upload</h3>
    <div class="example-container">
      <kup-fld
        :style="vaadinStyle"
        :config.prop="inputFileUpload"
        @ketchupFileUploaded="onFileUploaded"
        @ketchupFileRejected="onFileUploaded"
      />
    </div>
  </div>
</template>

<script>
//import '@vaadin/vaadin-upload/vaadin-upload.js'
import '@vaadin/vaadin-upload';

export default {
  name: 'FldTextInput',
  data() {
    return {
      fieldMaxLength: 5,
      basicInput: {},
      inputInitialValue: {},
      inputIsClearable: {},
      inputWithLabel: {},
      inputWithMaxLength: {},
      inputUsePassword: {},
      inputFileUpload: {},
    };
  },
  mounted() {
    import('@/mock/fldData.ts')
      .then((data) => {
        const { fldData, fldConfigItxFactory } = data;
        this.fldData = fldData;
        this.basicInput = fldConfigItxFactory();
        this.inputInitialValue = fldConfigItxFactory([
          {
            name: 'initialValue',
            value: 'Use initial value',
          },
        ]);
        this.inputIsClearable = fldConfigItxFactory([
          {
            name: 'initialValue',
            value: 'Use initial value',
          },
          {
            name: 'isClearable',
            value: 'true',
          },
        ]);
        this.inputWithLabel = fldConfigItxFactory([
          {
            name: 'label',
            value: 'The input label',
          },
        ]);
        this.inputWithMaxLength = fldConfigItxFactory([
          {
            name: 'maxLength',
            value: '5',
          },
        ]);
        this.inputUsePassword = fldConfigItxFactory([
          {
            name: 'inputType',
            value: 'password',
          },
        ]);
        this.inputFileUpload = {
          type: 'fup',
          typeOptions: {
            multi: true,
            confirm: true,
            drop: true,
            label: 'Upload template file',
            service:
              'https://webuptest.smeup.com/gtw/gtw-resource-manager/api/services/uploadTemplate',
          },
        };
        /*
              'maxSize':'5000', 
              'accept':'pdf',
             */
      })
      .catch((err) => {
        console.log(err);
      });
  },
  computed: {
    vaadinStyle() {
      /*
          '--kup-upload_background-color': 'green',
          '--kup-upload_color': 'orange',
          '--kup-upload_font-size': '1rem',
          '--kup-upload_border-radius': '3px'
         */
      return {};
    },
  },
  methods: {
    onUpdateMaxLength(e) {
      console.log(e);
      this.fieldMaxLength = e.detail.value;
    },
    onFileUploaded(e) {
      console.log('onFileUploaded', e.detail);
      const msgjson = JSON.parse(e.detail);
      console.log('msgjson', msgjson.messages);
    },
  },
  watch: {
    fieldMaxLength() {
      this.inputWithMaxLength = {
        ...this.inputWithMaxLength,
        maxLength: this.fieldMaxLength,
      };
    },
  },
};
</script>