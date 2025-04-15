<script>
  // Button component
  
  // Props
  export let type = 'button';  // button, submit, reset
  export let variant = 'primary'; // primary, secondary, success, danger, warning, info, light, dark
  export let size = 'medium'; // small, medium, large
  export let disabled = false;
  export let fullWidth = false;
  export let loading = false;
  export let icon = '';
  export let iconPosition = 'left'; // left, right
  export let onClick = null;
  
  // Additional classes
  export let className = '';
  
  // Handle click event
  function handleClick(event) {
    if (onClick && !disabled && !loading) {
      onClick(event);
    }
  }
  
  // Determine button size class
  const sizeClass = {
    small: 'btn-sm',
    medium: '',
    large: 'btn-lg'
  }[size] || '';
</script>

<button
  {type}
  class="btn btn-{variant} {sizeClass} {fullWidth ? 'btn-block' : ''} {className}"
  {disabled}
  class:loading={loading}
  on:click={handleClick}
>
  {#if loading}
    <span class="spinner"></span>
  {:else if icon && iconPosition === 'left'}
    <span class="btn-icon btn-icon-left">{icon}</span>
  {/if}
  
  <span class="btn-text">
    <slot>Button</slot>
  </span>
  
  {#if icon && iconPosition === 'right' && !loading}
    <span class="btn-icon btn-icon-right">{icon}</span>
  {/if}
</button>

<style lang="scss">
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: var(--border-radius-md, 0.25rem);
    transition: all 0.15s ease-in-out;
    cursor: pointer;
    position: relative;
    
    &:focus {
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
    }
    
    &:disabled, &.loading {
      opacity: 0.65;
      cursor: not-allowed;
    }
    
    // Size variants
    &.btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      border-radius: var(--border-radius-sm, 0.2rem);
    }
    
    &.btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.25rem;
      border-radius: var(--border-radius-lg, 0.3rem);
    }
    
    // Full width
    &.btn-block {
      display: flex;
      width: 100%;
    }
    
    // Color variants
    &.btn-primary {
      background-color: var(--ocean-primary, #2196f3);
      color: white;
      border-color: var(--ocean-primary, #2196f3);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: darken(#2196f3, 10%);
        border-color: darken(#2196f3, 10%);
      }
    }
    
    &.btn-secondary {
      background-color: var(--ocean-secondary, #90a4ae);
      color: white;
      border-color: var(--ocean-secondary, #90a4ae);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: darken(#90a4ae, 10%);
        border-color: darken(#90a4ae, 10%);
      }
    }
    
    &.btn-success {
      background-color: var(--ocean-success, #4caf50);
      color: white;
      border-color: var(--ocean-success, #4caf50);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: darken(#4caf50, 10%);
        border-color: darken(#4caf50, 10%);
      }
    }
    
    &.btn-danger {
      background-color: var(--ocean-coral, #ff5252);
      color: white;
      border-color: var(--ocean-coral, #ff5252);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: darken(#ff5252, 10%);
        border-color: darken(#ff5252, 10%);
      }
    }
    
    // Outline variants
    &.btn-outline-primary {
      background-color: transparent;
      color: var(--ocean-primary, #2196f3);
      border-color: var(--ocean-primary, #2196f3);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: var(--ocean-primary, #2196f3);
        color: white;
      }
    }
    
    &.btn-outline-secondary {
      background-color: transparent;
      color: var(--ocean-secondary, #90a4ae);
      border-color: var(--ocean-secondary, #90a4ae);
      
      &:hover:not(:disabled):not(.loading) {
        background-color: var(--ocean-secondary, #90a4ae);
        color: white;
      }
    }
  }
  
  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &.btn-icon-left {
      margin-right: 0.5rem;
    }
    
    &.btn-icon-right {
      margin-left: 0.5rem;
    }
  }
  
  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>