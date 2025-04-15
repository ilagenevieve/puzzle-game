<script>
  // Form input component with validation
  
  // Props
  export let id = '';
  export let name = '';
  export let type = 'text';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let required = false;
  export let error = '';
  export let autocomplete = '';
  export let minlength = null;
  export let maxlength = null;
  export let pattern = null;
  export let autofocus = false;
  export let helpText = '';
  
  // Expose a CSS class for external styling
  export let className = '';
  
  // Handle input changes
  function handleInput(event) {
    value = type === 'number' ? Number(event.target.value) : event.target.value;
  }
</script>

<div class="form-group {className}">
  {#if label}
    <label for={id} class="form-label">
      {label}
      {#if required}<span class="required-mark">*</span>{/if}
    </label>
  {/if}
  
  <input
    {id}
    {name}
    {type}
    class="form-control"
    class:is-invalid={error}
    {placeholder}
    {disabled}
    {required}
    {autocomplete}
    {autofocus}
    value={value}
    on:input={handleInput}
    on:change
    on:blur
    on:focus
    minlength={minlength}
    maxlength={maxlength}
    pattern={pattern}
  />
  
  {#if error}
    <div class="invalid-feedback">
      {error}
    </div>
  {/if}
  
  {#if helpText && !error}
    <div class="form-text">
      {helpText}
    </div>
  {/if}
</div>

<style lang="scss">
  .form-group {
    margin-bottom: var(--space-md, 1rem);
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: var(--ocean-text, #333);
  }
  
  .required-mark {
    color: var(--ocean-coral, #ff5252);
    margin-left: 0.25rem;
  }
  
  .form-control {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--ocean-text, #333);
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid var(--ocean-border, #ced4da);
    border-radius: var(--border-radius-md, 0.25rem);
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    
    &:focus {
      border-color: var(--ocean-primary, #2196f3);
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
    }
    
    &:disabled,
    &[readonly] {
      background-color: var(--ocean-bg-light, #f8f9fa);
      opacity: 1;
    }
    
    &.is-invalid {
      border-color: var(--ocean-coral, #ff5252);
      
      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 82, 82, 0.25);
      }
    }
  }
  
  .invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--ocean-coral, #ff5252);
  }
  
  .form-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--ocean-text-light, #6c757d);
  }
</style>