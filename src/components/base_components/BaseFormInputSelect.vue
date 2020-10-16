<template lang="pug">
  .space-y-1
    label#listbox-label.block.text-sm.leading-5.font-medium.text-gray-700(
      v-if="label"
      v-text="label"
    )
    .relative
      span.inline-block.w-full.rounded-md.shadow-sm
        button.dropdown-button(type='button' @click='listBoxOpen = !listBoxOpen')
          span.block.truncate(v-if="selectedLabel" v-text="selectedLabel")
          span.block.truncate.text-gray-400(
            v-else-if="placeholder"
            v-text="placeholder"
          )
          span.chevron-wrapper
            icon-chevron-down.chevron.transform(
              :class="{ '-rotate-180': listBoxOpen }"
            )
      button.fixed.inset-0.h-full.w-full.cursor-default.focus_outline-none(
        v-if='listBoxOpen'
        ref="clickOffButton"
        tabindex='-1'
        @click='listBoxOpen = false'
      )
      transition(name="dropdown")
        .dropdown-body(v-show='listBoxOpen')
          ul(tabindex='-1')
            li(
              v-for="(item, index) in items"
              :key="index"
              @click="select(itemValue(item))"
            )
              span.block.truncate(
                v-text="item.name"
                :class="itemClasses(itemValue(item))"
              )
              span.checkmark(v-if="value === itemValue(item)")
                icon-check-solid.h-5.w-5
</template>

<script>
  export default {
    props: {
      value: {
        type: [String, Number, Object],
        required: true,
      },
      valueKey: {
        type: String,
        default: '',
      },
      textKey: {
        type: String,
        default: '',
      },
      label: {
        type: String,
        default: null,
      },
      helperText: {
        type: String,
        default: null,
      },
      // TODO: If valueKey or textKey present, validate array of objects to contain them
      items: {
        type: Array,
        required: true,
      },
      placeholder: {
        type: String,
        default: null,
      },
      validator: {
        type: Object,
        default: null,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        listBoxOpen: false,
      };
    },
    computed: {
      selectedLabel() {
        if (!this.value) { return; }

        if (this.valueKey.length) {
          return this.items
            .find((item) => item[this.valueKey] === this.value)[this.textKey];
        }

        return this.items.find((item) => item === this.value);
      },
    },
    methods: {
      itemValue(item) {
        return this.valueKey.length ? item[this.valueKey] : item;
      },
      select(item) {
        this.$emit('input', item);
        this.listBoxOpen = false;
      },
      selected(item) {
        return this.selectedValue === item;
      },
      itemClasses(item) {
        return {
          'font-semibold': this.selectedValue === item,
          'font-normal': !this.selectedValue === item,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  ul {
    @apply max-h-60 rounded-md py-1 text-base leading-6 shadow-xs overflow-auto;

    &:focus {
      @apply outline-none;
    }

    @screen sm {
      @apply text-sm leading-5;
    }
  }

  li {
    @apply text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9;
    @apply text-sm;

    &:hover {
      @apply bg-gray-100 text-gray-900;
    }
  }

  .dropdown-button {
    @apply cursor-pointer relative w-full rounded-md border border-gray-300;
    @apply bg-white pl-3 pr-10 py-2 text-left;
    @apply transition ease-in-out duration-150;

    &:focus {
      @apply outline-none  shadow-outline-blue  border-blue-300;
    }

    @screen sm {
      @apply text-sm leading-5;
    }
  }

  .dropdown-body {
    // min-width: -webkit-max-content;
    // min-width: -moz-max-content;
    // min-width: max-content;
    @apply absolute origin-top-right mt-2 w-full rounded-md bg-white shadow-lg;
    @apply z-20;
  }

  .checkmark {
    @apply text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4;
  }

  .chevron {
    @apply h-5 w-5 text-gray-400 transition-transform duration-200 ease-in-out;
  }

  .chevron-wrapper {
    @apply absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none;
  }

  // Dropdown transition
  .dropdown-enter-active {
    @apply ease-out duration-100;
  }

  .dropdown-leave-active {
    @apply ease-in duration-75;
  }

  .dropdown-enter,
  .dropdown-leave-to {
    @apply transform opacity-0 scale-95;
  }

  .dropdown-enter-to,
  .dropdown-leave {
    @apply transform opacity-100 scale-100;
  }
</style>
