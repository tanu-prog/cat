const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API utility functions
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse(response);
    
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('token', this.token!);
      localStorage.setItem('dealer', JSON.stringify(data.data.dealer));
    }
    
    return data;
  }

  async register(dealerData: any) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealerData),
    });

    const data = await this.handleResponse(response);
    
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('token', this.token!);
      localStorage.setItem('dealer', JSON.stringify(data.data.dealer));
    }
    
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('dealer');
  }

  // Dashboard methods
  async getDashboardData() {
    const response = await fetch(`${this.baseURL}/dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAnalytics(period: string = '30') {
    const response = await fetch(`${this.baseURL}/dashboard/analytics?period=${period}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Search methods
  async search(query: string, type: string = 'all') {
    const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}&type=${type}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Alert methods
  async getAlerts(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/alerts?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUnreadAlertsCount() {
    const response = await fetch(`${this.baseURL}/alerts/unread-count`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markAlertAsRead(alertId: string) {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async resolveAlert(alertId: string, actionDescription: string) {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/resolve`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ actionDescription }),
    });
    return this.handleResponse(response);
  }

  // Customer methods
  async getCustomers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/customers?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCustomer(customerId: string) {
    const response = await fetch(`${this.baseURL}/customers/${customerId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createCustomer(customerData: any) {
    const response = await fetch(`${this.baseURL}/customers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(customerData),
    });
    return this.handleResponse(response);
  }

  async updateCustomer(customerId: string, customerData: any) {
    const response = await fetch(`${this.baseURL}/customers/${customerId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(customerData),
    });
    return this.handleResponse(response);
  }

  // Vehicle methods
  async getVehicles(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/vehicles?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getVehicle(vehicleId: string) {
    const response = await fetch(`${this.baseURL}/vehicles/${vehicleId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createVehicle(vehicleData: any) {
    const response = await fetch(`${this.baseURL}/vehicles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(vehicleData),
    });
    return this.handleResponse(response);
  }

  async updateVehicle(vehicleId: string, vehicleData: any) {
    const response = await fetch(`${this.baseURL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(vehicleData),
    });
    return this.handleResponse(response);
  }

  // Rental methods
  async getRentals(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/rentals?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getRental(rentalId: string) {
    const response = await fetch(`${this.baseURL}/rentals/${rentalId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createRental(rentalData: any) {
    const response = await fetch(`${this.baseURL}/rentals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(rentalData),
    });
    return this.handleResponse(response);
  }

  async updateRental(rentalId: string, rentalData: any) {
    const response = await fetch(`${this.baseURL}/rentals/${rentalId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(rentalData),
    });
    return this.handleResponse(response);
  }

  // Settings methods
  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async changePassword(passwordData: any) {
    const response = await fetch(`${this.baseURL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;