import axios from 'axios';

const API = axios.create({
    baseURL: 'https://pdfbooks.onrender.com/api', // Your backend URL
});

export default API;