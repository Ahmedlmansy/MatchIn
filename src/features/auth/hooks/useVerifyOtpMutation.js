import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyOtp, meRequest } from "@/features/auth/api/auth.api";
import { useAuthApiMutation } from "@/features/auth/hooks/useAuthApiMutation";
import { setCredentials } from "@/features/auth/store/auth.slice";
import { setAccessToken } from "@/services/axios/tokenStore";
import { useLocalizedPath } from "@/utils/routes";

/**
 * Register-wizard OTP step. This is where the real session starts
 * (convention §6): verifying the code sets the httpOnly session cookie, and the
 * body carries no user — so on success we read the user back with meRequest()
 * and put both into Redux before advancing the wizard.
 * If meRequest() returns 401 (no session created), we treat verification as
 * successful and navigate to login with email prefilled.
 *
 * @param {(user: object) => void} [onSuccess] - called with the user once the
 *   session is in Redux, so RegisterStep can advance to the CV step.
 * @param {(error: object) => void} [onError] - receives the already-normalized
 *   { status, message, fieldErrors } error.
 */
export const useVerifyOtpMutation = ({ onSuccess, onError } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("common");

  return useAuthApiMutation({
    // The follow-up /me is part of establishing the session, so it runs inside
    // mutationFn: a failure there must surface as this mutation's own error
    // rather than leave the wizard stuck on the OTP screen, unless it's 401.
    mutationFn: async (variables) => {
      const body = await verifyOtp(variables);

      // Verification can hand back a bearer token just like login does. It has
      // to reach tokenStore *before* the /auth/me below, or that call goes out
      // with no credential and 401s. This mutation used to dispatch
      // setCredentials({ user }) with no token, which zeroed auth.token, and
      // the store subscription pushed that null straight into tokenStore — so
      // a bearer-backed deployment ended this step authenticated in Redux but
      // anonymous on the wire.
      const token = body?.access_token ?? body?.token ?? null;
      if (token) setAccessToken(token);

      try {
        const user = await meRequest();
        dispatch(setCredentials({ user, token }));
        return user;
      } catch (error) {
        const status = error?.status ?? error?.response?.status;
        if (status === 401) {
          navigate(localizedPath("/auth/login"), {
            state: {
              email: variables.email,
              successMessage: t(
                "auth.otp.verifiedSuccessLogin",
                "Email verified successfully! Please log in to continue."
              ),
            },
            replace: true,
          });
          return null;
        }
        throw error;
      }
    },
    flow: "otp",
    onSuccess: (user, variables, context) => {
      if (user) {
        onSuccess?.(user, variables, context);
      }
    },
    onError,
  });
};
