import React, { useState } from 'react';
import API from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        pdfUrl: '',
        coverImage: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/books', formData);
            toast.success("Book added successfully!");
            setFormData({ title: '', description: '', price: '', pdfUrl: '', coverImage: '' });
        } catch (error) {
            toast.error("Failed to add book");
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Admin: Add New Book</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    name="title" 
                    placeholder="Book Title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px' }}
                />
                <textarea 
                    name="description" 
                    placeholder="Description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px', height: '100px' }}
                />
                <input 
                    name="price" 
                    type="number" 
                    placeholder="Price (KES)" 
                    value={formData.price} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px' }}
                />
                <input 
                    name="pdfUrl" 
                    placeholder="PDF Download Link (Drive/Cloudinary)" 
                    value={formData.pdfUrl} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px' }}
                />
                <input 
                    name="coverImage" 
                    placeholder="Cover Image URL (Optional)" 
                    value={formData.coverImage} 
                    onChange={handleChange} 
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Add Book
                </button>
            </form>
        </div>
    );
};

export default Admin;