import { useMutation } from '@tanstack/react-query';
import { logoutRequest } from '../api/auth.api'; // 
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../store/auth.slice';
import { useNavigate } from 'react-router-dom';

export const useLogoutMutation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      dispatch(clearCredentials());
      navigate('/login', { replace: true });
    },
    onError: () => {
      dispatch(clearCredentials());
      navigate('/login', { replace: true });
    }
  });
};