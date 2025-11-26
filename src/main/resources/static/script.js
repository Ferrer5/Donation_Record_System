/**
 * Donation System - Main JavaScript File
 * Handles navigation, API calls, and UI interactions
 */

// ==================== Configuration ====================
// Automatically detect if running locally or in production
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:8080/api' 
  : `${window.location.origin}/api`;

const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  TOAST_DURATION: 3000,
  REDIRECT_DELAY: 1000
};

// ==================== Announcement Utilities ====================
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

// ==================== Navigation Utilities ====================
const Navigation = {
  /**
   * Navigate to a specific page
   * @param {string} page - The HTML page to navigate to
   */
  goTo(page) {
    window.location.href = `${page}.html`;
  },

  /**
   * Navigate back in browser history
   */
  goBack() {
    window.history.back();
  },

  /**
   * Navigate to home page
   */
  goHome() {
    this.goTo('index');
  }
};

// Navigation functions for backward compatibility
function goToSignUp() { Navigation.goTo('signup'); }
function goBack() { Navigation.goBack(); }
function goToLogin() { Navigation.goTo('login'); }
function goHome() { Navigation.goHome(); }
function goToForgot() { Navigation.goTo('forgot'); }
async function goToForgot1() { 
  // Send verification code before navigating
  await PasswordReset.requestCode();
}
async function goToChangepass() { 
  // Verify code before navigating to change password
  await PasswordReset.verifyCode();
}
function goToSuccChanged() { Navigation.goTo('succChanged'); }
function goToAdminLogin() { Navigation.goTo('adminlogin'); }
function goToUserInt() { Navigation.goTo('userInt'); }
function goToNotif() { Navigation.goTo('notification'); }
function goToUserHistory() { Navigation.goTo('userhistory'); }
function goToDonationForm() { Navigation.goTo('donationform'); }
function goToAdminInterface() { Navigation.goTo('adminInt'); }
function goToAddRecord() { Navigation.goTo('addrecord'); }
function goToMembers() { Navigation.goTo('members'); }
function goToViewRecord() { Navigation.goTo('adminrecord'); }
function goToAnnouncement() { Navigation.goTo('announcement'); }

// ==================== Toast Notification System ====================
const Toast = {
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success' or 'error')
   */
  show(message, type = 'error') {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after duration
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

// ==================== API Utilities ====================
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
   * Handle user signup
   */
  async signup() {
    const requiredFields = ['username', 'email', 'password'];
    
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const { username, email, password } = FormUtils.getValues(requiredFields);

    try {
      const data = await API.post('/signup', { username, email, password });
      
      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        setTimeout(() => {
          Navigation.goTo('login');
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
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

/**
 * Signup user - called from signup form
 */
function signupUser() {
  Auth.signup();
}

/**
 * Admin login - called from admin login form
 */
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

// ==================== Donation Functions ====================
const Donation = {
  /**
   * Handle donation type change to show/hide appropriate fields
   */
  handleTypeChange() {
    const typeSelect = document.getElementById('type');
    const amountField = document.getElementById('amountField');
    const itemsField = document.getElementById('itemsField');
    const amountInput = document.getElementById('amount');
    const itemsInput = document.getElementById('numberOfItems');
    
    if (!typeSelect || !amountField || !itemsField) {
      return;
    }
    
    const selectedType = typeSelect.value;
    
    // Hide both fields initially
    amountField.style.display = 'none';
    itemsField.style.display = 'none';
    
    // Remove required attribute from both inputs
    if (amountInput) amountInput.removeAttribute('required');
    if (itemsInput) itemsInput.removeAttribute('required');
    
    // Clear values when switching types
    if (amountInput) amountInput.value = '';
    if (itemsInput) itemsInput.value = '';
    
    // Show appropriate field based on selection
    if (selectedType === 'Cash') {
      amountField.style.display = 'block';
      if (amountInput) amountInput.setAttribute('required', 'required');
    } else if (selectedType === 'Goods') {
      itemsField.style.display = 'block';
      if (itemsInput) itemsInput.setAttribute('required', 'required');
    }
    // For Food and Others, neither field is shown (user can use message field)
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
    
    // Validate based on donation type
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

    // Get amount or items based on type
    let amount = 0;
    let itemsDescription = '';
    
    if (type === 'Cash') {
      amount = parseFloat(FormUtils.getValue('amount'));
    } else if (type === 'Goods') {
      itemsDescription = FormUtils.getValue('numberOfItems');
      // For goods, we'll store the description in the amount field as 0
      // and append it to the message, or we could modify backend
      // For now, let's store it in message field
    }

    try {
      // For Goods, combine items description with message
      const finalMessage = type === 'Goods' && itemsDescription 
        ? `Items: ${itemsDescription}${message ? '\n\n' + message : ''}`
        : message || '';
      
      // For Goods, send 0 as amount (backend expects a number)
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
        // Reset form
        document.getElementById('donationForm').reset();
        // Hide fields after reset
        this.handleTypeChange();
        // Redirect to user interface after a delay
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

/**
 * Handle user logout
 */
function handleLogout() {
  toggleSettingsMenu(); // Close menu
  
  if (confirm('Are you sure you want to log out?')) {
    // Clear user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('resetUsername');
    localStorage.removeItem('resetCode');
    
    // Redirect to home page
    Navigation.goHome();
  }
}

/**
 * Handle admin logout
 */
function handleAdminLogout() {
  toggleSettingsMenu(); // Close menu
  
  if (confirm('Are you sure you want to log out?')) {
    // Clear admin data
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('resetUsername');
    localStorage.removeItem('resetCode');
    
    // Redirect to home page
    Navigation.goHome();
  }
}

/**
 * Handle account deletion
 */
async function handleDeleteAccount() {
  toggleSettingsMenu(); // Close menu
  
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
  
  // Double confirmation
  const finalConfirm = confirm('This is your last chance. Delete account permanently?');
  if (!finalConfirm) {
    return;
  }
  
  try {
    const data = await API.post('/delete-account', { username });
    
    Toast.show(data.message, data.success ? 'success' : 'error');
    
    if (data.success) {
      // Clear all user data
      localStorage.clear();
      
      setTimeout(() => {
        Navigation.goHome();
      }, CONFIG.REDIRECT_DELAY);
    }
  } catch (error) {
    Toast.error('An error occurred while deleting your account. Please try again.');
  }
}
