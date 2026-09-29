import { useDispatch } from "react-redux";
import { useApiMutation } from "@/hooks/useApiMutation";
import { loginRequest, meRequest } from "../api/auth.api";
import { setCredentials } from "../store/auth.slice";
import { tokenStorage } from "@/lib/token";


export const useLoginMutation = ({ onAuthenticated } = {}) => {
  const dispatch = useDispatch();

  return useApiMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      tokenStorage.set(data.access_token);
      const user = await meRequest(); // the request interceptor now has a token to attach
      dispatch(setCredentials({ user, token: data.access_token }));
      onAuthenticated?.(user);
    },
  });
};
