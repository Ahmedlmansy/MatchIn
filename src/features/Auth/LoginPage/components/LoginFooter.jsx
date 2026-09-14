import React from 'react'
import { Link } from 'react-router-dom'

export default function LoginFooter() {
  return (
    <>
            <p className="text-[#64748b] -mt-3">
              By signing in, you agree to MatchIn's{" "}
              <Link className="underline">Terms</Link> and{" "}
              <Link className="underline">Privacy Policy</Link>.
            </p>
            <p className="text-[#64748b] mt-3">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="text-[#2563eb] font-semibold hover:underline"
              >
                Create an account →
              </Link>
            </p>
          </>
  )
}
