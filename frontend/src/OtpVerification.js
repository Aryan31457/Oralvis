import React, { useState } from 'react';
import axios from 'axios';

const OtpVerification = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/verifyemail', { email, verificationcode: otp });
      if (res.data.success) {
        onVerified();
      } else {
        setError('Invalid or expired OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>OTP Verification</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          maxLength={6}
          pattern="\d{6}"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      </form>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

export default OtpVerification;
