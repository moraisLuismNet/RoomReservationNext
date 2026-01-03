import { useState, useEffect } from 'react';

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  imageRoom?: string;
  roomType?: {
    name: string;
  };
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms');
      const data = await response.json();
      
      if (data.success) {
        setRooms(data.data);
      } else {
        setError(data.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return { rooms, loading, error, refetch: fetchRooms };
};