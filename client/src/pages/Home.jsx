import React, { useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [phone, setPhone] = useState('');
    
    // New state variables for payment process
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null

    // Fetch books on load
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await API.get('/books');
                setBooks(res.data);
            } catch (error) {
                console.error("Failed to fetch books");
            }
        };
        fetchBooks();
    }, []);

    // Open Payment Modal
    const handleBuy = (book) => {
        setSelectedBook(book);
        setPaymentStatus(null); // Reset status
        setIsProcessing(false);
        setPhone('');
    };

    // Close Modal
    const closeModal = () => {
        setSelectedBook(null);
        setIsProcessing(false);
        setCurrentOrderId(null);
        setPaymentStatus(null);
    };

    // Process Payment
    const handlePayment = async () => {
        if (!phone) return toast.error("Please enter phone number");

        setIsProcessing(true); // Show loading state
        setPaymentStatus(null);

        try {
            // 1. Initiate Payment
            const res = await API.post('/payment/initiate', {
                bookId: selectedBook._id,
                phoneNumber: phone
            });
            
            setCurrentOrderId(res.data.orderId);
            toast.info("STK Push sent. Please check your phone...");

        } catch (error) {
            toast.error("Payment initiation failed");
            setIsProcessing(false);
        }
    };

    // POLLING LOGIC: Check status every 3 seconds if processing
    useEffect(() => {
        let interval;

        if (isProcessing && currentOrderId) {
            interval = setInterval(async () => {
                try {
                    const res = await API.get(`/payment/status/${currentOrderId}`);
                    
                    if (res.data.status === 'Paid') {
                        setIsProcessing(false);
                        setPaymentStatus('success');
                        toast.success("Payment Successful!");
                        clearInterval(interval); // Stop polling
                    } else if (res.data.status === 'Failed') {
                        setIsProcessing(false);
                        setPaymentStatus('failed');
                        toast.error("Payment Failed or Cancelled.");
                        clearInterval(interval); // Stop polling
                    }
                    // If status is 'Pending', do nothing and keep polling
                } catch (error) {
                    console.error("Error checking status", error);
                }
            }, 3000); // Check every 3 seconds
        }

        // Cleanup interval on unmount or if modal closes
        return () => clearInterval(interval);
    }, [isProcessing, currentOrderId]);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>PDF Book Store</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {books.map(book => (
                    <div key={book._id} style={cardStyle}>
                        {book.coverImage && (
                            <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        )}
                        <h3>{book.title}</h3>
                        <p>{book.description.substring(0, 50)}...</p>
                        <h4>KES {book.price}</h4>
                        <button 
                            onClick={() => handleBuy(book)}
                            style={buyBtnStyle}
                        >
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {selectedBook && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        
                        {/* STATE 1: Initial Form */}
                        {!isProcessing && !paymentStatus && (
                            <>
                                <h3>Buy: {selectedBook.title}</h3>
                                <p>Price: KES {selectedBook.price}</p>
                                <input 
                                    type="text" 
                                    placeholder="Phone Number (e.g., 0712345678)" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handlePayment} style={payBtnStyle}>Pay with M-Pesa</button>
                                    <button onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
                                </div>
                            </>
                        )}

                        {/* STATE 2: Processing / Waiting */}
                        {isProcessing && (
                            <div style={{ textAlign: 'center' }}>
                                <h3>Processing Payment...</h3>
                                <div className="spinner" style={{ margin: '20px auto', fontSize: '24px' }}>⏳</div>
                                <p>Please check your phone and enter M-PESA PIN.</p>
                                <p><small>Waiting for confirmation...</small></p>
                                <button onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
                            </div>
                        )}

                        {/* STATE 3: Success */}
                        {paymentStatus === 'success' && (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: 'green' }}>✅ Payment Successful!</h3>
                                <p>Thank you for purchasing {selectedBook.title}.</p>
                                <a 
                                    href={selectedBook.pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ ...payBtnStyle, textDecoration: 'none', display: 'block', marginBottom: '10px' }}
                                >
                                    Download PDF
                                </a>
                                <button onClick={closeModal} style={cancelBtnStyle}>Close</button>
                            </div>
                        )}

                        {/* STATE 4: Failed */}
                        {paymentStatus === 'failed' && (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: 'red' }}>❌ Payment Failed</h3>
                                <p>The transaction was cancelled or failed.</p>
                                <button onClick={() => { setPaymentStatus(null); setIsProcessing(false); }} style={payBtnStyle}>
                                    Try Again
                                </button>
                                <button onClick={closeModal} style={cancelBtnStyle}>Close</button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const cardStyle = { border: '1px solid #ddd', borderRadius: '8px', width: '300px', padding: '15px', background: '#fff' };
const buyBtnStyle = { width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const payBtnStyle = { width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const cancelBtnStyle = { width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '25px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

export default Home;