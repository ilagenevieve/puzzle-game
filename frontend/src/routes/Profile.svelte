<script>
  import { onMount } from 'svelte'
  import { userStore, displayName, toastStore } from '../stores/user-store'
  import { getCurrentUser, updateUserProfile, changePassword } from '../services/api'
  import FormInput from '../components/form/FormInput.svelte'
  import Button from '../components/form/Button.svelte'
  
  let loading = true
  let error = null
  let editMode = false
  let isUpdating = false
  let user = null
  let formData = {
    display_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  }
  
  // Form validation flags
  let passwordError = ''
  let confirmPasswordError = ''
  let displayNameError = ''
  let emailError = ''
  
  onMount(async () => {
    try {
      loading = true
      const response = await getCurrentUser()
      if (response && response.data && response.data.user) {
        user = response.data.user
        // Initialize form data with current user data
        formData.display_name = user.display_name || ''
        formData.email = user.email || ''
      }
    } catch (err) {
      error = err.message || 'Failed to load profile'
      toastStore.show('Failed to load profile data', 'error')
    } finally {
      loading = false
    }
  })
  
  function toggleEditMode() {
    editMode = !editMode
    
    if (!editMode) {
      // Reset form when canceling
      formData.display_name = user.display_name || ''
      formData.email = user.email || ''
      formData.current_password = ''
      formData.new_password = ''
      formData.confirm_password = ''
      
      // Clear validation errors
      resetFormErrors()
    }
  }
  
  function resetFormErrors() {
    passwordError = ''
    confirmPasswordError = ''
    displayNameError = ''
    emailError = ''
    error = null
  }
  
  function validateForm() {
    let isValid = true
    
    // Reset all errors
    resetFormErrors()
    
    // Validate display name
    if (!formData.display_name.trim()) {
      displayNameError = 'Display name is required'
      isValid = false
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      emailError = 'Email is required'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      emailError = 'Please enter a valid email address'
      isValid = false
    }
    
    // Only validate if changing password
    if (formData.new_password || formData.current_password) {
      if (!formData.current_password) {
        passwordError = 'Current password is required'
        isValid = false
      }
      
      if (formData.new_password && formData.new_password.length < 8) {
        passwordError = 'New password must be at least 8 characters'
        isValid = false
      }
      
      if (formData.new_password !== formData.confirm_password) {
        confirmPasswordError = 'Passwords do not match'
        isValid = false
      }
    }
    
    return isValid
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return
    }
    
    isUpdating = true
    
    try {
      // Update profile information (display name, email)
      const profileData = {
        display_name: formData.display_name,
        email: formData.email
      }
      
      await updateUserProfile(profileData)
      
      // If password fields are filled, update password
      if (formData.current_password && formData.new_password) {
        const passwordData = {
          current_password: formData.current_password,
          new_password: formData.new_password
        }
        
        await changePassword(passwordData)
      }
      
      // Refresh user data
      const response = await getCurrentUser()
      if (response && response.data && response.data.user) {
        user = response.data.user
        userStore.setUser(user)
      }
      
      // Show success message
      toastStore.show('Profile updated successfully', 'success')
      
      // Reset password fields
      formData.current_password = ''
      formData.new_password = ''
      formData.confirm_password = ''
      
      // Exit edit mode
      editMode = false
    } catch (err) {
      error = err.message || 'Failed to update profile'
      toastStore.show(error, 'error')
    } finally {
      isUpdating = false
    }
  }
</script>

<section class="profile-page">
  <div class="profile-header">
    <h1>My Profile</h1>
    {#if !editMode && user}
      <Button 
        variant="primary" 
        onClick={toggleEditMode} 
        icon="✏️"
      >
        Edit Profile
      </Button>
    {/if}
  </div>
  
  {#if loading}
    <div class="loading">
      <div class="wave-loader">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
      <p>Loading profile...</p>
    </div>
  {:else if error && !user}
    <div class="error">
      <p>{error}</p>
      <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  {:else if user}
    <div class="profile-container">
      <div class="profile-card">
        {#if !editMode}
          <!-- View Mode -->
          <div class="avatar-section">
            <div class="avatar">{user.display_name?.[0] || user.username?.[0] || '?'}</div>
            <h2>{$displayName}</h2>
          </div>
          
          <div class="info-section">
            <div class="info-item">
              <span class="label">Username</span>
              <span class="value">{user.username}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Email</span>
              <span class="value">{user.email}</span>
            </div>
            
            <div class="info-item">
              <span class="label">Member Since</span>
              <span class="value">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        {:else}
          <!-- Edit Mode -->
          <form class="edit-form" on:submit|preventDefault={handleSubmit}>
            <FormInput
              id="display_name"
              label="Display Name"
              type="text"
              value={formData.display_name}
              error={displayNameError}
              placeholder="Enter your display name"
              disabled={isUpdating}
              required={true}
              on:input={(e) => formData.display_name = e.target.value}
            />
            
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              error={emailError}
              placeholder="Enter your email address"
              disabled={isUpdating}
              required={true}
              on:input={(e) => formData.email = e.target.value}
            />
            
            <h3>Change Password</h3>
            <FormInput
              id="current_password"
              label="Current Password"
              type="password"
              value={formData.current_password}
              error={passwordError}
              placeholder="Enter your current password"
              disabled={isUpdating}
              autocomplete="current-password"
              on:input={(e) => formData.current_password = e.target.value}
            />
            
            <FormInput
              id="new_password"
              label="New Password"
              type="password"
              value={formData.new_password}
              placeholder="Enter your new password"
              disabled={isUpdating}
              helpText="Leave blank to keep current password. Must be at least 8 characters."
              minlength="8"
              autocomplete="new-password"
              on:input={(e) => formData.new_password = e.target.value}
            />
            
            <FormInput
              id="confirm_password"
              label="Confirm New Password"
              type="password"
              value={formData.confirm_password}
              error={confirmPasswordError}
              placeholder="Confirm your new password"
              disabled={isUpdating}
              autocomplete="new-password"
              on:input={(e) => formData.confirm_password = e.target.value}
            />
            
            <div class="form-actions">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={toggleEditMode} 
                disabled={isUpdating}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                variant="primary" 
                loading={isUpdating}
                disabled={isUpdating}
              >
                Save Changes
              </Button>
            </div>
          </form>
        {/if}
      </div>

      <div class="stats-card">
        <h2>Game Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{user.stats?.games_played || 0}</span>
            <span class="stat-label">Games Played</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{user.stats?.wins || 0}</span>
            <span class="stat-label">Wins</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{user.stats?.win_rate || '0%'}</span>
            <span class="stat-label">Win Rate</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{user.stats?.rank || 'N/A'}</span>
            <span class="stat-label">Ranking</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</section>

<style lang="scss">
  .profile-page {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    
    h1 {
      margin: 0;
      color: var(--ocean-primary);
    }
  }
  
  .profile-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    
    @media (min-width: 768px) {
      grid-template-columns: 3fr 2fr;
    }
  }
  
  .profile-card, .stats-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .avatar-section {
    padding: 2rem;
    background: linear-gradient(135deg, var(--ocean-secondary), var(--ocean-primary));
    color: white;
    text-align: center;
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: white;
      color: var(--ocean-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    h2 {
      margin: 0;
      font-size: 1.5rem;
    }
  }
  
  .info-section {
    padding: 1.5rem;
  }
  
  .info-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--ocean-accent-light);
    
    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .label {
      display: block;
      font-size: 0.9rem;
      color: var(--ocean-text-light);
      margin-bottom: 0.2rem;
    }
    
    .value {
      display: block;
      font-size: 1.1rem;
      color: var(--ocean-text);
    }
  }
  
  .edit-form {
    padding: 1.5rem;
  }
  
  h3 {
    font-size: 1.1rem;
    color: var(--ocean-text);
    margin: 1.5rem 0 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--ocean-accent-light);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .stats-card {
    padding: 1.5rem;
    
    h2 {
      margin-top: 0;
      color: var(--ocean-text);
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--ocean-accent-light);
      padding-bottom: 0.5rem;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--ocean-primary);
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: var(--ocean-text-light);
      margin-top: 0.5rem;
    }
  }
  
  .loading, .error {
    padding: 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .error {
    color: var(--ocean-error);
  }
  
  .wave-loader {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 50px;
    width: 100px;
    margin-bottom: 1rem;
    
    .wave {
      width: 8px;
      height: 40px;
      margin: 0 3px;
      background-color: var(--ocean-primary);
      border-radius: 10px;
      animation: wave 1s ease-in-out infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
  
  @keyframes wave {
    0% {
      height: 10px;
    }
    50% {
      height: 40px;
    }
    100% {
      height: 10px;
    }
  }
</style>