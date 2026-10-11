import { useDispatch } from "react-redux";
import { verifyOtp, meRequest } from "@/features/auth/api/auth.api";
import { useAuthApiMutation } from "@/features/auth/hooks/useAuthApiMutation";
import { setCredentials } from "@/features/auth/store/auth.slice";

/**
 * Register-wizard OTP step. This is where the real session starts
 * (convention §6): verifying the code sets the httpOnly session cookie, and the
 * body carries no user — so on success we read the user back with meRequest()
 * and put both into Redux before advancing the wizard.
 *
 * @param {(user: object) => void} [onSuccess] - called with the user once the
 *   session is in Redux, so RegisterStep can advance to the CV step.
 * @param {(error: object) => void} [onError] - receives the already-normalized
 *   { status, message, fieldErrors } error.
 */
export const useVerifyOtpMutation = ({ onSuccess, onError } = {}) => {
  const dispatch = useDispatch();

  return useAuthApiMutation({
    // The follow-up /me is part of establishing the session, so it runs inside
    // mutationFn: a failure there must surface as this mutation's own error
    // rather than leave the wizard stuck on the OTP screen.
    mutationFn: async (variables) => {
      await verifyOtp(variables);
      const user = await meRequest();
      dispatch(setCredentials({ user }));
      return user;
    },
    flow: "otp",
    onSuccess,
    onError,
  });
};
