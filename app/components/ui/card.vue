<template>
  <slot></slot>
</template>

<script>
import { defineComponent, h } from 'vue';

// Utility function for merging class names
const mergeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Card Components
export const Card = defineComponent({
  name: 'Card',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: mergeClasses(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        props.class
      ),
      ...attrs
    }, slots.default?.());
  }
});

export const CardHeader = defineComponent({
  name: 'CardHeader',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: mergeClasses('flex flex-col space-y-1.5 p-6', props.class),
      ...attrs
    }, slots.default?.());
  }
});

export const CardTitle = defineComponent({
  name: 'CardTitle',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('h3', {
      class: mergeClasses(
        'text-2xl font-semibold leading-none tracking-tight',
        props.class
      ),
      ...attrs
    }, slots.default?.());
  }
});

export const CardDescription = defineComponent({
  name: 'CardDescription',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('p', {
      class: mergeClasses('text-sm text-muted-foreground', props.class),
      ...attrs
    }, slots.default?.());
  }
});

export const CardContent = defineComponent({
  name: 'CardContent',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: mergeClasses('p-6 pt-0', props.class),
      ...attrs
    }, slots.default?.());
  }
});

export const CardFooter = defineComponent({
  name: 'CardFooter',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots, attrs }) {
    return () => h('div', {
      class: mergeClasses('flex items-center p-6 pt-0', props.class),
      ...attrs
    }, slots.default?.());
  }
});

export default {
  name: 'CardComponentsExample'
}
</script>