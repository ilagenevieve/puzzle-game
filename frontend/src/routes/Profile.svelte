<script>
  import { onMount } from 'svelte'
  import { userStore, displayName } from '../stores/user-store'
  import { getCurrentUser, updateUserProfile, changePassword } from '../services/api'
  
  let loading = true
  let error = null
  let success = null
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
  
  onMount(async () => {
    try {
      const response = await getCurrentUser()
      if (response && response.data && response.data.user) {
        user = response.data.user
        // Initialize form data with current user data
        formData.display_name = user.display_name || ''
        formData.email = user.email || ''
      }
    } catch (err) {
      error = err.message || 'Failed to load profile'
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
      // Clear validation errors and success messages
      passwordError = ''
      confirmPasswordError = ''
      success = null
      error = null
    }
  }
  
  function validatePasswordFields() {
    let isValid = true
    
    // Reset errors
    passwordError = ''
    confirmPasswordError = ''
    
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
    success = null
    error = null
    
    if (!validatePasswordFields()) {
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
      
      success = 'Profile updated successfully'
      
      // Reset password fields
      formData.current_password = ''
      formData.new_password = ''
      formData.confirm_password = ''
      
      // Exit edit mode
      editMode = false
    } catch (err) {
      error = err.message || 'Failed to update profile'
    } finally {
      isUpdating = false
    }
  }
</script>

<section class="profile-page">
  <div class="profile-header">
    <h1>My Profile</h1>
    {#if !editMode}
      <button class="edit-button" on:click={toggleEditMode}>Edit Profile</button>
    {/if}
  </div>
  
  {#if success}
    <div class="success-message">{success}</div>
  {/if}
  
  {#if loading}
    <div class="loading">Loading profile...</div>
  {:else if error}
    <div class="error">{error}</div>
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
            <div class="form-group">
              <label for="display_name">Display Name</label>
              <input 
                type="text" 
                id="display_name" 
                bind:value={formData.display_name} 
                placeholder="Display Name" 
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                bind:value={formData.email} 
                placeholder="Email" 
              />
            </div>
            
            <h3>Change Password</h3>
            <div class="form-group">
              <label for="current_password">Current Password</label>
              <input 
                type="password" 
                id="current_password" 
                class:is-invalid={passwordError && formData.current_password.length === 0}
                bind:value={formData.current_password} 
                placeholder="Current Password" 
                disabled={isUpdating}
              />
              {#if passwordError}
                <div class="invalid-feedback">{passwordError}</div>
              {/if}
            </div>
            
            <div class="form-group">
              <label for="new_password">New Password</label>
              <input 
                type="password" 
                id="new_password" 
                class:is-invalid={passwordError && formData.new_password.length > 0 && formData.new_password.length < 8}
                bind:value={formData.new_password} 
                placeholder="New Password" 
                disabled={isUpdating}
              />
              <small class="form-text text-muted">Leave blank to keep current password</small>
            </div>
            
            <div class="form-group">
              <label for="confirm_password">Confirm New Password</label>
              <input 
                type="password" 
                id="confirm_password" 
                class:is-invalid={confirmPasswordError}
                bind:value={formData.confirm_password} 
                placeholder="Confirm New Password" 
                disabled={isUpdating}
              />
              {#if confirmPasswordError}
                <div class="invalid-feedback">{confirmPasswordError}</div>
              {/if}
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-button" on:click={toggleEditMode} disabled={isUpdating}>Cancel</button>
              <button type="submit" class="save-button" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
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
    
    .edit-button {
      background-color: var(--ocean-primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--ocean-secondary);
      }
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
  
  .form-group {
    margin-bottom: 1.2rem;
    
    label {
      display: block;
      font-size: 0.9rem;
      color: var(--ocean-text-light);
      margin-bottom: 0.5rem;
    }
    
    input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid var(--ocean-accent-light);
      border-radius: 4px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: var(--ocean-primary);
        box-shadow: 0 0 0 2px rgba(var(--ocean-primary-rgb), 0.2);
      }
    }
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
    
    button {
      padding: 0.7rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .cancel-button {
      background-color: transparent;
      border: 1px solid var(--ocean-text-light);
      color: var(--ocean-text);
      
      &:hover {
        background-color: var(--ocean-bg-light);
      }
    }
    
    .save-button {
      background-color: var(--ocean-primary);
      border: none;
      color: white;
      
      &:hover {
        background-color: var(--ocean-secondary);
      }
    }
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
  }
  
  .error {
    color: var(--ocean-error);
  }
  
  .success-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    background-color: rgba(46, 204, 113, 0.1);
    border: 1px solid #2ecc71;
    color: #2ecc71;
    border-radius: 6px;
    text-align: center;
  }
  
  .invalid-feedback {
    color: var(--ocean-error);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  
  .is-invalid {
    border-color: var(--ocean-error) !important;
  }
  
  .form-text {
    font-size: 0.85rem;
    color: var(--ocean-text-light);
    margin-top: 0.25rem;
  }
</style>