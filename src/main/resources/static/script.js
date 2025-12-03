const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:8080/api' 
  : `${window.location.origin}/api`;

const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  TOAST_DURATION: 3000,
  REDIRECT_DELAY: 1000
};

const AnnouncementBoard = {
  STORAGE_KEY: 'adminAnnouncements',

  defaultAnnouncements() {
    const now = Date.now();
    return [
      {
        title: 'Barangay Relief Packing',
        message: 'Volunteers needed at the municipal gym on Saturday, 9AM. Please bring your own water bottle.',
        audience: 'Volunteers',
        priority: 'Important',
        author: localStorage.getItem('adminUser') || 'Administrator',
        timestamp: new Date(now).toISOString()
      },
      {
        title: 'Typhoon Response Update',
        message: 'Cash donations are prioritized this week to purchase additional tarpaulins and rice sacks.',
        audience: 'All Donors',
        priority: 'Urgent',
        author: 'Administrator',
        timestamp: new Date(now - 86400000).toISOString()
      }
    ];
  },

  ensureDefaults() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.save(this.defaultAnnouncements());
    }
  },

  list() {
    try {
      this.ensureDefaults();
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid announcement payload');
      }
      return parsed.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      const defaults = this.defaultAnnouncements();
      this.save(defaults);
      return defaults;
    }
  },

  save(list) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list.slice(0, 10)));
  },

  add(entry) {
    const updated = [entry, ...this.list()];
    this.save(updated);
    return updated;
  },

  remove(timestamp) {
    const filtered = this.list().filter(item => item.timestamp !== timestamp);
    this.save(filtered);
    return filtered;
  }
};

const Navigation = {
  goTo(page) {
    window.location.href = `${page}.html`;
  },

  goBack() {
    window.history.back();
  },

  goHome() {
    this.goTo('index');
  }
};

function goToSignUp() { Navigation.goTo('signup'); }
function goBack() { Navigation.goBack(); }
function goToLogin() { Navigation.goTo('login'); }
function goHome() { Navigation.goHome(); }
function goToForgot() { Navigation.goTo('forgot'); }
async function goToForgot1() { 
  await PasswordReset.requestCode();
}
async function goToChangepass() { 
  await PasswordReset.verifyCode();
}
function goToSuccChanged() { Navigation.goTo('succChanged'); }
function goToAdminLogin() { Navigation.goTo('adminlogin'); }
function goToUserInt() { Navigation.goTo('userInt'); }
function goToNotif() {
  // Route directly based on user role to avoid unexpected redirects.
  try {
    const adminUser = localStorage.getItem('adminUser');
    const username = localStorage.getItem('currentUser');
    if (adminUser) {
      Navigation.goTo('adminnotification');
      return;
    }
    if (username) {
      Navigation.goTo('usernotification');
      return;
    }
    // Fallback to login if no user is present
    Navigation.goTo('login');
  } catch (err) {
    console.error('Error routing to notifications:', err);
    Navigation.goTo('notification');
  }
}
function goToUserNotif() {
  Navigation.goTo('usernotification');
}
function goToUserHistory() { Navigation.goTo('userhistory'); }
function goToDonationForm() { Navigation.goTo('donationform'); }
function goToAdminInterface() { Navigation.goTo('adminInt'); }
function goToAddRecord() { Navigation.goTo('addrecord'); }
function goToMembers() { Navigation.goTo('members'); }
function goToViewRecord() { Navigation.goTo('adminrecord'); }
function goToAnnouncement() { Navigation.goTo('announcement'); }

const Toast = {
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success' or 'error')
   */
  show(message, type = 'error') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, CONFIG.TOAST_DURATION);
  },

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  success(message) {
    this.show(message, 'success');
  },

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  error(message) {
    this.show(message, 'error');
  }
};

const API = {
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint (e.g., '/login')
   * @param {Object} options - Fetch options (method, body, etc.)
   * @returns {Promise} - Promise that resolves with JSON response
   */
  async request(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * POST request helper
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @returns {Promise} - Promise with response
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  ,
  /**
   * Get announcements from server
   */
  async getAnnouncements() {
    try {
      return await this.request('/announcements');
    } catch (err) {
      console.warn('Failed to fetch announcements from API, falling back to local storage', err);
      throw err;
    }
  },
  /**
   * Delete an announcement by id
   */
  async deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  }
};

// ==================== Form Utilities ====================
const FormUtils = {
  /**
   * Get form field value by ID
   * @param {string} fieldId - The ID of the form field
   * @returns {string} - Field value
   */
  getValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
  },

  /**
   * Get multiple form field values
   * @param {string[]} fieldIds - Array of field IDs
   * @returns {Object} - Object with field values
   */
  getValues(fieldIds) {
    return fieldIds.reduce((values, id) => {
      values[id] = this.getValue(id);
      return values;
    }, {});
  },

  /**
   * Validate required fields
   * @param {string[]} fieldIds - Array of required field IDs
   * @returns {boolean} - True if all fields are filled
   */
  validateRequired(fieldIds) {
    const missingFields = fieldIds.filter(id => !this.getValue(id));
    
    if (missingFields.length > 0) {
      Toast.error('Please fill in all required fields');
      return false;
    }
    
    return true;
  }
};

// ==================== Authentication Functions ====================
const Auth = {
  /**
   * Handle login
   */
  async login() {
    const requiredFields = ['username', 'password'];
    
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const { username, password } = FormUtils.getValues(requiredFields);

    try {
      const data = await API.post('/login', { username, password });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Store username in localStorage for donation tracking
        localStorage.setItem('currentUser', username);
        setTimeout(() => {
          Navigation.goTo('userInt');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  },

  /**
   * Check if a field has a validation error
   */
  hasValidationError(fieldId) {
    const input = document.getElementById(fieldId);
    return input && !input.validity.valid;
  },

  /**
   * Handle user signup
   */
  async signup() {
    const requiredFields = ['username', 'email', 'password'];
    
    // Validate required fields
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const { username, email, password } = FormUtils.getValues(requiredFields);
    
    // Force validation of username and email
    await checkUsernameAvailability(username);
    await checkEmailAvailability(email);
    
    // Check for validation errors
    if (this.hasValidationError('username') || this.hasValidationError('email')) {
      Toast.error('Please fix the validation errors before submitting.');
      return;
    }
    
    // Check if passwords match
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      Toast.error('Passwords do not match');
      return;
    }

    try {
      const data = await API.post('/signup', { username, email, password });
      
      if (data.success) {
        Toast.success(data.message);
        setTimeout(() => {
          Navigation.goTo('login');
        }, CONFIG.REDIRECT_DELAY);
      } else {
        Toast.error(data.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Toast.error('An error occurred. Please try again.');
    }
  }
};

// ==================== Admin Authentication Functions ====================
const AdminAuth = {
  /**
   * Handle admin login
   */
  async login() {
    const requiredFields = ['adminName', 'adminPassword'];
    
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const { adminName, adminPassword } = FormUtils.getValues(requiredFields);

    try {
      const data = await API.post('/admin/login', { 
        adminName, 
        password: adminPassword 
      });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Store admin name in localStorage
        localStorage.setItem('adminUser', adminName);
        setTimeout(() => {
          Navigation.goTo('adminInt');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  }
};

// ==================== Public API (for HTML onclick handlers) ====================
/**
 * Login user - called from login form
 */
function loginUser() {
  Auth.login();
}

function signupUser() {
  Auth.signup();
}

function adminLogin() {
  AdminAuth.login();
}

/**
 * Show toast notification - public API
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success' or 'error')
 */
function showToast(message, type = 'error') {
  Toast.show(message, type);
}

const Donation = {
  handleTypeChange() {
    const typeSelect = document.getElementById('type');
    const amountField = document.getElementById('amountField');
    const itemsField = document.getElementById('itemsField');
    const amountInput = document.getElementById('amount');
    const itemsInput = document.getElementById('numberOfItems');
    const otherDonationField = document.getElementById('otherDonation');
    
    if (!typeSelect || !amountField || !itemsField) {
      return;
    }
    
    const selectedType = typeSelect.value;
    
    if (amountField) amountField.style.display = 'none';
    if (itemsField) itemsField.style.display = 'none';
    if (otherDonationField) otherDonationField.style.display = 'none';
    
    if (amountInput) amountInput.removeAttribute('required');
    if (itemsInput) itemsInput.removeAttribute('required');
    if (otherDonationField) otherDonationField.removeAttribute('required');
    
    if (amountInput) amountInput.value = '';
    if (itemsInput) itemsInput.value = '';
    if (otherDonationField) otherDonationField.value = '';
    
    if (selectedType === 'Cash') {
      if (amountField) amountField.style.display = 'block';
      if (amountInput) amountInput.setAttribute('required', 'required');
    } else if (selectedType === 'Goods') {
      if (itemsField) itemsField.style.display = 'block';
      if (itemsInput) itemsInput.setAttribute('required', 'required');
    } else if (selectedType === 'Others') {
      if (otherDonationField) {
        otherDonationField.style.display = 'block';
        otherDonationField.setAttribute('required', 'required');
      }
    }
  },

  /**
   * Submit donation form
   * @param {Event} event - Form submit event
   */
  async submit(event) {
    event.preventDefault();
    
    const requiredFields = ['fullname', 'email', 'type'];
    
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const username = localStorage.getItem('currentUser');
    if (!username) {
      Toast.error('Please log in first');
      Navigation.goTo('login');
      return;
    }

    const type = FormUtils.getValue('type');
    const amountInput = document.getElementById('amount');
    const itemsInput = document.getElementById('numberOfItems');

    if (type === 'Cash') {
      const amount = FormUtils.getValue('amount');
      if (!amount || parseFloat(amount) <= 0) {
        Toast.error('Please enter a valid donation amount');
        return;
      }
    } else if (type === 'Goods') {
      const numberOfItems = FormUtils.getValue('numberOfItems');
      if (!numberOfItems || numberOfItems.trim() === '') {
        Toast.error('Please enter the number of items');
        return;
      }
    }

    const { fullname, email, message } = FormUtils.getValues([
      'fullname', 'email', 'message'
    ]);

    let amount = 0;
    let itemsDescription = '';
    
    if (type === 'Cash') {
      amount = parseFloat(FormUtils.getValue('amount'));
    } else if (type === 'Goods') {
      itemsDescription = FormUtils.getValue('numberOfItems');
    }

    try {

      const finalMessage = type === 'Goods' && itemsDescription 
        ? `Items: ${itemsDescription}${message ? '\n\n' + message : ''}`
        : message || '';
      
      const amountToSend = type === 'Cash' ? amount : 0;

      const data = await API.post('/donations/submit', {
        username,
        fullName: fullname,
        email,
        donationType: type,
        amount: amountToSend,
        message: finalMessage
      });

      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        document.getElementById('donationForm').reset();
        this.handleTypeChange();
        setTimeout(() => {
          Navigation.goTo('userInt');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  },

  /**
   * Get user donations for history
   * @param {string} username - Username to get donations for
   * @returns {Promise<Array>} - Array of donations
   */
  async getUserDonations(username) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/donations/user/${username}`);
      const data = await response.json();
      return data.success ? data.donations : [];
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  },

  /**
   * Get pending donations for admin
   * @returns {Promise<Array>} - Array of pending donations
   */
  async getPendingDonations() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/donations/pending`);
      const data = await response.json();
      return data.success ? data.donations : [];
    } catch (error) {
      console.error('Error fetching pending donations:', error);
      return [];
    }
  },

  /**
   * Approve a donation
   * @param {number} donationId - ID of donation to approve
   * @returns {Promise<boolean>} - Success status
   */
  async approve(donationId) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/donations/${donationId}/approve`, {
        method: 'PUT'
      });
      const data = await response.json();
      Toast.show(data.message, data.success ? 'success' : 'error');
      return data.success;
    } catch (error) {
      Toast.error('Error approving donation');
      return false;
    }
  },

  /**
   * Remove a pending donation
   * @param {number} donationId - ID of donation to remove
   * @returns {Promise<boolean>} - Success status
   */
  async remove(donationId) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/donations/${donationId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      Toast.show(data.message || 'Donation removed successfully', data.success ? 'success' : 'error');
      return data.success;
    } catch (error) {
      console.error('Error removing donation:', error);
      Toast.error('Error removing donation');
      return false;
    }
  },

  /**
   * Get user notifications (approved donations)
   * @param {string} username - Username to get notifications for
   * @returns {Promise<Array>} - Array of notifications
   */
  async getUserNotifications(username) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/donations/user/${username}/notifications`);
      const data = await response.json();
      return data.success ? data.notifications : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Format amount for display
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatAmount(amount) {
    return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Submit donation - called from donation form
 * @param {Event} event - Form submit event
 */
function submitDonation(event) {
  Donation.submit(event);
}

/**
 * Handle donation type change - called from donation form
 */
function handleDonationTypeChange() {
  Donation.handleTypeChange();
}

// ==================== Password Reset Functions ====================
const PasswordReset = {
  /**
   * Request password reset code
   */
  async requestCode() {
    const username = FormUtils.getValue('forgot-username');
    const email = FormUtils.getValue('forgot-email');

    if (!username || !email) {
      Toast.error('Please fill in all fields');
      return;
    }

    try {
      const data = await API.post('/forgot-password', { username, email });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Store username for verification step
        localStorage.setItem('resetUsername', username);
        setTimeout(() => {
          Navigation.goTo('forgot1');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  },

  /**
   * Verify code and proceed to password reset
   */
  async verifyCode() {
    const username = localStorage.getItem('resetUsername');
    const code = FormUtils.getValue('verification-code');

    if (!username) {
      Toast.error('Session expired. Please start over.');
      Navigation.goTo('forgot');
      return;
    }

    if (!code) {
      Toast.error('Please enter the verification code');
      return;
    }

    try {
      const data = await API.post('/verify-code', { username, code });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Store code for password reset
        localStorage.setItem('resetCode', code);
        setTimeout(() => {
          Navigation.goTo('changepass');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  },

  /**
   * Reset password
   */
  async resetPassword() {
    const username = localStorage.getItem('resetUsername');
    const code = localStorage.getItem('resetCode');
    const newPassword = FormUtils.getValue('new-password');
    const confirmPassword = FormUtils.getValue('confirm-password');

    if (!username || !code) {
      Toast.error('Session expired. Please start over.');
      Navigation.goTo('forgot');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error('Passwords do not match');
      return;
    }

    try {
      const data = await API.post('/reset-password', { 
        username, 
        code, 
        newPassword, 
        confirmPassword 
      });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Clear reset data
        localStorage.removeItem('resetUsername');
        localStorage.removeItem('resetCode');
        setTimeout(() => {
          Navigation.goTo('succChanged');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  }
};

/**
 * Reset password - called from change password form
 */
function resetPassword() {
  PasswordReset.resetPassword();
}

// ==================== User Interface Functions ====================
/**
 * Display username on user interface page
 */
function displayUsername() {
  const username = localStorage.getItem('currentUser');
  const usernameDisplay = document.getElementById('username-display');
  
  if (usernameDisplay) {
    if (username) {
      usernameDisplay.textContent = username;
    } else {
      // If no username found, redirect to login
      Navigation.goTo('login');
    }
  }
}

// Clear username status when user focuses on the username field
function clearUsernameStatus() {
  const statusElement = document.getElementById('username-status');
  const usernameInput = document.getElementById('username');
  
  // Clear status message and any validation errors
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  usernameInput.setCustomValidity('');
}

// Clear email status when user focuses on the email field
function clearEmailStatus() {
  const statusElement = document.getElementById('email-status');
  const emailInput = document.getElementById('email');
  
  // Clear status message and any validation errors
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  emailInput.setCustomValidity('');
}

// Clear password status when user focuses on the password field
function clearPasswordStatus() {
  const statusElement = document.getElementById('password-status');
  const passwordInput = document.getElementById('password');
  
  // Clear status message and any validation errors
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  passwordInput.setCustomValidity('');
}

// Validate password strength
function validatePassword(password) {
  const statusElement = document.getElementById('password-status');
  const passwordInput = document.getElementById('password');
  
  // Clear previous status
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  passwordInput.setCustomValidity('');
  
  // Check password requirements
  const minLength = 5;
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  // Build error messages
  const errors = [];
  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }
  if (!hasLowercase) {
    errors.push('one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('one number');
  }
  
  // If there are errors, show them
  if (errors.length > 0) {
    const errorMessage = `Password must contain: ${errors.join(', ')}`;
    statusElement.textContent = `* ${errorMessage}`;
    statusElement.className = 'status-message taken';
    passwordInput.setCustomValidity(errorMessage);
    return false;
  }
  
  // Password is valid
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  passwordInput.setCustomValidity('');
  return true;
}

// Check email availability and format
async function checkEmailAvailability(email) {
  const statusElement = document.getElementById('email-status');
  const emailInput = document.getElementById('email');
  
  // Clear previous status
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    statusElement.textContent = 'Please enter a valid email address';
    statusElement.className = 'status-message taken';
    emailInput.setCustomValidity('Please enter a valid email address');
    return;
  }
  
  try {
    // Check if email exists
    const response = await fetch(`${CONFIG.API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Email check response:', data);
    
    if (data.available === true) {
      // Clear the status message when email is available and valid
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    } else {
      statusElement.textContent = '✗ Email is already registered';
      statusElement.className = 'status-message taken';
      emailInput.setCustomValidity('Email is already registered');
    }
  } catch (error) {
    console.error('Error checking email:', error);
    statusElement.textContent = 'Error checking email availability';
    statusElement.className = 'status-message';
  }
}

// Check username availability
async function checkUsernameAvailability(username) {
  const statusElement = document.getElementById('username-status');
  const usernameInput = document.getElementById('username');
  
  // Clear previous status
  statusElement.textContent = '';
  statusElement.className = 'status-message';
  
  // Don't check if username is empty or too short
  if (!username || username.length < 3) {
    if (username && username.length > 0) {
      statusElement.textContent = 'Username must be at least 3 characters';
      statusElement.className = 'status-message taken';
      usernameInput.setCustomValidity('Username must be at least 3 characters');
    } else {
      usernameInput.setCustomValidity('');
    }
    return;
  }
  
  try {
    // Check if username exists
    const response = await fetch(`${CONFIG.API_BASE_URL}/check-username?username=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Username check response:', data); // Debug log
    
    if (data.available === true) {
      // Clear the status message when username is available
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    } else {
      statusElement.textContent = '✗ Username is already taken';
      statusElement.className = 'status-message taken';
    }
  } catch (error) {
    console.error('Error checking username:', error);
    statusElement.textContent = 'Error checking username availability';
    statusElement.className = 'status-message';
  }
}

// Auto-display username when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the user interface page
  if (document.getElementById('username-display')) {
    displayUsername();
  }
  
  // Initialize donation form fields if on donation form page
  if (document.getElementById('type')) {
    Donation.handleTypeChange();
  }
});

// ==================== Settings Menu Functions ====================
/**
 * Toggle settings dropdown menu
 */
function toggleSettingsMenu() {
  const menu = document.getElementById('settingsMenu');
  menu.classList.toggle('show');
}

// Close settings menu when clicking outside
document.addEventListener('click', function(event) {
  const settingsContainer = document.querySelector('.settings-container');
  const settingsMenu = document.getElementById('settingsMenu');
  
  if (settingsContainer && !settingsContainer.contains(event.target) && settingsMenu) {
    settingsMenu.classList.remove('show');
  }
});

/**
 * Show About information
 */
function showAbout() {
  toggleSettingsMenu(); // Close menu
  alert('Donation Report System\n\n' +
        'Version: 1.0.0\n\n' +
        'A community donation management system that allows users to submit donations and track their contribution history.\n\n' +
        'Developed by CTU Ginatilan Students.\n\n' +
        '© 2025 All Rights Reserved');
}
function handleLogout() {
  toggleSettingsMenu();
  
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('resetUsername');
    localStorage.removeItem('resetCode');
    
    Navigation.goHome();
  }
}

function handleAdminLogout() {
  toggleSettingsMenu(); 
  
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('resetUsername');
    localStorage.removeItem('resetCode');
    
    Navigation.goHome();
  }
}

// ==================== Notification Functions ====================
/**
 * Load user notifications (only their own donations with PENDING or APPROVED status)
 * @param {string} username - Username to load notifications for
 */
async function loadUserNotifications(username) {
  const container = document.getElementById('notificationsContainer');
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) loadingMessage.remove();

  try {
    // Fetch user's donations
    const donations = await Donation.getUserDonations(username);
    
    // Filter to only show PENDING or APPROVED statuses for this user
    const relevant = donations.filter(d => d.status === 'PENDING' || d.status === 'APPROVED');

    if (relevant.length === 0) {
      container.innerHTML = '<div class="notif-box"><p>No donations yet. Your donations (pending or approved) will appear here.</p></div>';
      renderAnnouncementNotifications(container, '📢 Community Announcements');
      return;
    }

    // Separate pending and approved for better organization and sort by date (newest first)
    const pending = relevant
      .filter(d => d.status === 'PENDING')
      .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
      
    const approved = relevant
      .filter(d => d.status === 'APPROVED')
      .sort((a, b) => new Date(b.approvalDate || b.donationDate) - new Date(a.approvalDate || a.donationDate));

    let html = '';
    if (pending.length > 0) {
      html += '<h3 style="color: #fff; margin: 15px 0 10px 0; font-size: 1.1rem;">⏳ Pending Donations</h3>';
      html += pending.map(donation => formatUserNotification(donation, true)).join('');
    }
    if (approved.length > 0) {
      html += '<h3 style="color: #fff; margin: 20px 0 10px 0; font-size: 1.1rem;">✅ Approved Donations</h3>';
      html += approved.map(donation => formatUserNotification(donation, false)).join('');
    }

    container.innerHTML = html;
    renderAnnouncementNotifications(container, '📢 Community Announcements');
  } catch (error) {
    console.error('Error loading user notifications:', error);
    container.innerHTML = '<div class="notif-box"><p>Error loading notifications. Please try again.</p></div>';
  }
}

/**
 * Format a donation notification for user view
 * @param {Object} donation - Donation object
 * @param {boolean} isPending - Whether the donation is pending
 * @returns {string} - Formatted HTML
 */
function formatUserNotification(donation, isPending) {
  const amountDisplay = donation.donationType === 'Cash' 
    ? Donation.formatAmount(donation.amount)
    : donation.message ? donation.message.split('\n')[0].replace('Items: ', '') : 'N/A';

  const statusText = isPending ? '⏳ Pending' : '✅ Approved';
  const statusNote = isPending
    ? `Your donation of <strong>${amountDisplay}</strong> (${donation.donationType}) is pending approval.`
    : `Your donation of <strong>${amountDisplay}</strong> (${donation.donationType}) has been approved.`;

  // Render full notification box (no collapse behavior)
  return `
    <div class="notif-box">
      <div style="margin-bottom: 6px;"><strong>${statusText}</strong></div>
      <div style="font-size: 0.95rem; margin-bottom: 6px;"><strong>Type:</strong> ${donation.donationType} | <strong>Amount/Items:</strong> ${amountDisplay}</div>
      ${donation.message && donation.donationType !== 'Goods' ? `<div style="margin-bottom:6px;"> <em>${donation.message}</em></div>` : ''}
      <div style="font-size: 0.8rem; color: #333;">Submitted: ${Donation.formatDate(donation.createdAt)}</div>
    </div>
  `;
}

/**
 * Load admin notifications (all donations with pending/approved status)
 */
async function loadAdminNotifications() {
  const container = document.getElementById('notificationsContainer');
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) loadingMessage.remove();

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/donations/all`);
    const data = await response.json();
    if (!data.success) {
      container.innerHTML = '<div class="notif-box"><p>Error loading notifications.</p></div>';
      return;
    }

    const donations = data.donations || [];
    const recentDonations = donations.slice(0, 20);

    if (recentDonations.length === 0) {
      container.innerHTML = '<div class="notif-box"><p>No donations yet.</p></div>';
      renderAnnouncementNotifications(container, '📢 Posted Announcements');
      return;
    }

    const pending = recentDonations.filter(d => d.status === 'PENDING');
    const approved = recentDonations.filter(d => d.status === 'APPROVED');

    let html = '';
    if (pending.length > 0) {
      html += '<h3 style="color: #fff; margin: 15px 0 10px 0; font-size: 1.1rem;">⏳ Pending Donations</h3>';
      html += pending.map(donation => formatAdminNotification(donation, true)).join('');
    }
    if (approved.length > 0) {
      html += '<h3 style="color: #fff; margin: 20px 0 10px 0; font-size: 1.1rem;">✅ Approved Donations</h3>';
      html += approved.map(donation => formatAdminNotification(donation, false)).join('');
    }

    container.innerHTML = html;
    renderAnnouncementNotifications(container, '📢 Posted Announcements');
  } catch (error) {
    console.error('Error loading admin notifications:', error);
    container.innerHTML = '<div class="notif-box"><p>Error loading notifications. Please try again.</p></div>';
  }
}

/**
 * Format a donation notification for admin view
 * @param {Object} donation - Donation object
 * @param {boolean} isPending - Whether the donation is pending
 * @returns {string} - Formatted HTML
 */
function formatAdminNotification(donation, isPending) {
  const amountDisplay = donation.donationType === 'Cash' 
    ? Donation.formatAmount(donation.amount)
    : donation.message ? donation.message.split('\n')[0].replace('Items: ', '') : 'N/A';

  const statusBadge = isPending 
    ? '<span style="background: #ff7b00; color: #000; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">PENDING</span>'
    : '<span style="background: #4caf50; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">APPROVED</span>';

  const approveButton = isPending 
    ? `<button class="red-btn" style="margin-top: 10px; padding: 8px 15px; font-size: 0.9rem;" onclick="approveDonationFromNotif(${donation.id})">Approve Donation</button>`
    : '';

  return `
    <div class="notif-box" style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong>${donation.fullName}</strong>
        ${statusBadge}
      </div>
      <p><strong>Type:</strong> ${donation.donationType} | <strong>Amount/Items:</strong> ${amountDisplay}</p>
      ${donation.email ? `<p><strong>Email:</strong> ${donation.email}</p>` : ''}
      ${donation.message && donation.donationType !== 'Goods' ? `<p><em>${donation.message}</em></p>` : ''}
      <p><small>Submitted: ${Donation.formatDate(donation.createdAt)}</small></p>
      ${approveButton}
    </div>
  `;
}

/**
 * Approve a donation from notification view
 * @param {number} donationId - ID of donation to approve
 */
async function approveDonationFromNotif(donationId) {
  const success = await Donation.approve(donationId);
  if (success) await loadAdminNotifications();
}

/**
 * Render announcements in notification view
 * @param {Element} container - Container element
 * @param {string} headingText - Heading text for announcements
 */
function renderAnnouncementNotifications(container, headingText) {
  (async () => {
    try {
      const res = await API.getAnnouncements();
      if (res && res.success && Array.isArray(res.announcements) && res.announcements.length) {
        const cards = res.announcements.map(a => `
          <div class="notif-box">
            <p><strong>📢 ${a.title}</strong></p>
            <p>${a.message}</p>
            <p style="font-size: 0.85rem; margin-top: 8px;">Audience: ${a.audience || 'All Donors'} • Priority: ${a.priority || 'Normal'}</p>
            <span class="notif-time">${new Date(a.datePosted || a.timestamp || a.date_posted).toLocaleString()}</span>
          </div>
        `).join('');

        container.insertAdjacentHTML('beforeend', `
          <h3 style="color: #fff; margin: 25px 0 10px 0; font-size: 1.1rem;">${headingText}</h3>
          ${cards}
        `);
        return;
      }
    } catch (err) {
      console.warn('Announcements API not available, falling back to local storage', err);
    }

    if (!window.AnnouncementBoard) return;
    const announcements = AnnouncementBoard.list();
    if (!announcements.length) return;
    const announcementCards = announcements.map(announcement => `
      <div class="notif-box">
        <p><strong>📢 ${announcement.title}</strong></p>
        <p>${announcement.message}</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">Audience: ${announcement.audience} • Priority: ${announcement.priority}</p>
        <span class="notif-time">${new Date(announcement.timestamp).toLocaleString()}</span>
      </div>
    `).join('');

    container.insertAdjacentHTML('beforeend', `
      <h3 style="color: #fff; margin: 25px 0 10px 0; font-size: 1.1rem;">${headingText}</h3>
      ${announcementCards}
    `);
  })();
}

/**
 * Toggle notification expansion (used by user notification cards)
 * @param {HTMLElement} el - The notif-box element clicked
 */



async function handleDeleteAccount() {
  toggleSettingsMenu();
  
  const username = localStorage.getItem('currentUser');
  
  if (!username) {
    Toast.error('You must be logged in to delete your account');
    Navigation.goTo('login');
    return;
  }
  
  const confirmDelete = confirm(
    '⚠️ WARNING: This action cannot be undone!\n\n' +
    'Deleting your account will:\n' +
    '• Permanently remove your account\n' +
    '• Delete all your donation records\n' +
    '• Remove all associated data\n\n' +
    'Are you absolutely sure you want to delete your account?'
  );
  
  if (!confirmDelete) {
    return;
  }
  
  const finalConfirm = confirm('This is your last chance. Delete account permanently?');
  if (!finalConfirm) {
    return;
  }
  
  try {
    // Use DELETE method to match backend @DeleteMapping("/delete-account")
    const data = await API.request('/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ username })
    });

    Toast.show(data.message, data.success ? 'success' : 'error');

    if (data.success) {
      localStorage.clear();

      setTimeout(() => {
        Navigation.goHome();
      }, CONFIG.REDIRECT_DELAY);
    }
  } catch (error) {
    Toast.error('An error occurred while deleting your account. Please try again.');
    console.error('Delete account error:', error);
  }
}
