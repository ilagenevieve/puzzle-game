<script>
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { toastStore } from '../../stores/user-store'
  
  // Props
  export let autohide = true
  export let position = 'top-right' // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  
  // Position classes
  const positionClass = {
    'top-right': 'toast-container--top-right',
    'top-left': 'toast-container--top-left',
    'bottom-right': 'toast-container--bottom-right',
    'bottom-left': 'toast-container--bottom-left',
  }
  
  // Helper to create nice type-based icon
  function getIconForType(type) {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }
  
  // Handle close toast
  function closeToast(id) {
    toastStore.remove(id)
  }
</script>

{#if $toastStore.messages.length > 0}
  <div class="toast-container {positionClass[position] || 'toast-container--top-right'}">
    {#each $toastStore.messages as toast (toast.id)}
      <div 
        class="toast-item toast-{toast.type}"
        transition:fly={{ y: position.includes('top') ? -20 : 20, duration: 300 }}
      >
        <div class="toast-icon">
          {getIconForType(toast.type)}
        </div>
        <div class="toast-content">
          <p>{toast.message}</p>
        </div>
        <button class="toast-close" on:click={() => closeToast(toast.id)} aria-label="Close toast">
          ×
        </button>
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .toast-container {
    position: fixed;
    z-index: 9999;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    max-width: 450px;
    
    &--top-right {
      top: 1rem;
      right: 1rem;
    }
    
    &--top-left {
      top: 1rem;
      left: 1rem;
    }
    
    &--bottom-right {
      bottom: 1rem;
      right: 1rem;
    }
    
    &--bottom-left {
      bottom: 1rem;
      left: 1rem;
    }
  }
  
  .toast-item {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    pointer-events: auto;
    min-width: 260px;
    max-width: 100%;
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
    }
    
    &.toast-success {
      &::before {
        background-color: var(--ocean-success, #4caf50);
      }
    }
    
    &.toast-error {
      &::before {
        background-color: var(--ocean-coral, #ff5252);
      }
    }
    
    &.toast-warning {
      &::before {
        background-color: var(--ocean-warning, #ff9800);
      }
    }
    
    &.toast-info {
      &::before {
        background-color: var(--ocean-primary, #2196f3);
      }
    }
  }
  
  .toast-icon {
    margin-right: 0.75rem;
    min-width: 20px;
    font-size: 1.2rem;
  }
  
  .toast-content {
    flex: 1;
    p {
      margin: 0;
      line-height: 1.4;
    }
  }
  
  .toast-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0;
    margin-left: 0.5rem;
    opacity: 0.6;
    transition: opacity 0.2s;
    
    &:hover, &:focus {
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    .toast-container {
      left: 0.5rem;
      right: 0.5rem;
      max-width: calc(100% - 1rem);
      
      &--top-right, &--top-left {
        top: 0.5rem;
      }
      
      &--bottom-right, &--bottom-left {
        bottom: 0.5rem;
      }
    }
  }
</style>