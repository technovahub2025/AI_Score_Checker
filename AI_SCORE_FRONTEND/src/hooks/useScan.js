import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScan } from '../services/api';

const useScan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const submit = async (payload) => {
    try {
      setLoading(true);
      setError('');
      const result = await submitScan(payload);
      setData(result);
      navigate(`/results/${result._id}`);
      return result;
    } catch (err) {
      setError(err.message || 'Unable to start scan.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    setError,
    submit
  };
};

export default useScan;
