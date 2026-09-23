const API_BASE_URL = '/api';

export const getHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching health status:', error);
        throw error;
    }
};

export const getDatasetSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/dataset/summary`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dataset summary:', error);
        throw error;
    }
};

export const getDashboard = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

export const getPractical13 = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.program && filters.program !== 'All') queryParams.append('program', filters.program);
        if (filters.course && filters.course !== 'All') queryParams.append('course', filters.course);
        if (filters.semester && filters.semester !== 'All') queryParams.append('semester', filters.semester);
        if (filters.year && filters.year !== 'All') queryParams.append('year', filters.year);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/practical13${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching practical 13 data:', error);
        throw error;
    }
};

export const getPractical14 = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.program && filters.program !== 'All') queryParams.append('program', filters.program);
        if (filters.risk && filters.risk !== 'All') queryParams.append('risk', filters.risk);
        if (filters.year && filters.year !== 'All') queryParams.append('year', filters.year);
        if (filters.res && filters.res !== 'All') queryParams.append('res', filters.res);
        if (filters.schol && filters.schol !== 'All') queryParams.append('schol', filters.schol);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/practical14${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching practical 14 data:', error);
        throw error;
    }
};

export const getPractical15 = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.program && filters.program !== 'All') queryParams.append('program', filters.program);
        if (filters.course && filters.course !== 'All') queryParams.append('course', filters.course);
        if (filters.year && filters.year !== 'All') queryParams.append('year', filters.year);
        if (filters.sem && filters.sem !== 'All') queryParams.append('sem', filters.sem);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/practical15${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching practical 15 data:', error);
        throw error;
    }
};

export const getLiveStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/live/status`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
};

export const startLiveSimulation = async (role, interval_ms) => {
    const response = await fetch(`${API_BASE_URL}/live/start?interval_ms=${interval_ms}`, {
        method: 'POST',
        headers: { 'X-Role': role }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Network response was not ok');
    }
    return await response.json();
};

export const stopLiveSimulation = async (role) => {
    const response = await fetch(`${API_BASE_URL}/live/stop`, {
        method: 'POST',
        headers: { 'X-Role': role }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Network response was not ok');
    }
    return await response.json();
};

export const simulateOneUpdate = async (role) => {
    const response = await fetch(`${API_BASE_URL}/live/update`, {
        method: 'POST',
        headers: { 'X-Role': role }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Network response was not ok');
    }
    return await response.json();
};

export const resetLiveDataset = async (role) => {
    const response = await fetch(`${API_BASE_URL}/live/reset`, {
        method: 'POST',
        headers: { 'X-Role': role }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Network response was not ok');
    }
    return await response.json();
};

export const getDataQuality = async () => {
    const response = await fetch(`${API_BASE_URL}/data-quality`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
};
