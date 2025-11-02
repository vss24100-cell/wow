const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Animals
  async getAnimals() {
    const response = await fetch(`${API_URL}/api/animals/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch animals');
    return response.json();
  },

  async getAnimal(animalId: string) {
    const response = await fetch(`${API_URL}/api/animals/${animalId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch animal');
    return response.json();
  },

  // Observations
  async getObservations(animalId?: string) {
    const url = animalId 
      ? `${API_URL}/api/observations/?animal_id=${animalId}`
      : `${API_URL}/api/observations/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch observations');
    return response.json();
  },

  async createObservation(data: any) {
    const response = await fetch(`${API_URL}/api/observations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create observation');
    return response.json();
  },

  async transcribeAudio(audioBlob: Blob, language: string = 'hi') {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', language);

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/observations/audio-transcribe`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to transcribe audio');
    return response.json();
  },

  async createEmergencyAlert(data: { animal_id: string; description: string; observation_id?: string }) {
    const response = await fetch(`${API_URL}/api/observations/emergency-alert`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create emergency alert');
    return response.json();
  },

  // Auth
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_URL}/api/users/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
};
