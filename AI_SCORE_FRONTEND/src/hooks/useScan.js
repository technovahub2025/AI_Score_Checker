import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScans } from '../context/ScansContext';

const useScan = () => {
  const navigate = useNavigate();
  const { createScan } = useScans();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const submit = async ({ mode, input, file }) => {
    try {
      setLoading(true);
      setError('');
      const scan = await createScan({ mode, input, file });
      setData(scan);
      navigate(`/results/${scan.id}`);
      return scan;
    } catch (err) {
      setError(err.message || 'Unable to analyze content.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, setError, submit };
};

export default useScan;
