/**
 * Donation System - Main JavaScript File
 * Handles navigation, API calls, and UI interactions
 */

// ==================== Configuration ====================
const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api',
  TOAST_DURATION: 3000,
  REDIRECT_DELAY: 1000
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
function goToForgot1() { Navigation.goTo('forgot1'); }
function goToChangepass() { Navigation.goTo('changepass'); }
function goToSuccChanged() { Navigation.goTo('succChanged'); }
function goToAdminLogin() { Navigation.goTo('adminlogin'); }
function goToUserInt() { Navigation.goTo('userInt'); }
function goToNotif() { Navigation.goTo('notification'); }
function goToUserHistory() { Navigation.goTo('userhistory'); }
function goToDonationForm() { Navigation.goTo('donationform'); }
function goToAdminInterface() { Navigation.goTo('adminInt'); }
function goToAddRecord() { Navigation.goTo('addrecord'); }
function goToMembers() { Navigation.goTo('members'); }

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
   * Submit donation form
   * @param {Event} event - Form submit event
   */
  async submit(event) {
    event.preventDefault();
    
    const requiredFields = ['fullname', 'email', 'type', 'amount'];
    
    if (!FormUtils.validateRequired(requiredFields)) {
      return;
    }

    const username = localStorage.getItem('currentUser');
    if (!username) {
      Toast.error('Please log in first');
      Navigation.goTo('login');
      return;
    }

    const { fullname, email, type, amount, message } = FormUtils.getValues([
      'fullname', 'email', 'type', 'amount', 'message'
    ]);

    try {
      const data = await API.post('/donations/submit', {
        username,
        fullName: fullname,
        email,
        donationType: type,
        amount: parseFloat(amount),
        message: message || ''
      });

      Toast.show(data.message, data.success ? 'success' : 'error');
      
      if (data.success) {
        // Reset form
        document.getElementById('donationForm').reset();
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
