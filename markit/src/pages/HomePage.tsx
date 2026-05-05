import { useEffect, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { getToken } from "../lib/api";
import Input from "../components/Input";
import { usersService } from "../services/users";

type FormView = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string {
  if (!value) return "";
  return EMAIL_RE.test(value) ? "" : "Enter a valid email address";
}

export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormView>("login");

  // Already logged in — go straight to dashboard
  useEffect(() => {
    if (getToken()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onSwitchToSignup() {
    setPassword("");
    setEmailError("");
    setError("");
    setForm("signup");
  }

  function onSwitchToLogin() {
    setPassword("");
    setEmailError("");
    setError("");
    setForm("login");
  }

  function handleEmailBlur(e: FocusEvent<HTMLInputElement>) {
    if (form === "signup") setEmailError(validateEmail(e.currentTarget.value));
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (form === "signup" && emailError) setEmailError(validateEmail(e.target.value));
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await usersService.login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const [name, setName] = useState("");

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setError("");
    setLoading(true);
    try {
      await usersService.register({ email, password, name: name || undefined });
      await usersService.login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  const passwordHelperText =
    password.length === 0
      ? "Use 8+ characters with letters and numbers"
      : password.length < 8
      ? `${8 - password.length} more character${8 - password.length === 1 ? "" : "s"} needed`
      : "Looks good!";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-stone-100 p-2">
      <div className="border border-stone-200 rounded-4xl overflow-hidden grid grid-cols-1 md:grid-cols-5 grid-rows-4 md:grid-rows-1 shadow-xl w-full max-w-4xl">
        <div className="relative row-span-1 md:row-span-1 col-span-1 md:col-span-2 bg-stone-50 border-r border-stone-200 py-14 px-6 items-end flex flex-col gap-4 overflow-hidden">
          <img src="/logo.svg" className="w-1/2" />
          <h4 className="">Book<span className="font-bold">mark <span className="text-teal-600">it</span></span> wherever, whenever.</h4>
          <img src={form == "login" ? "/float.svg" : "/clumsy.svg"} className="welcome-character " />
        </div>
        <div className="flex flex-col row-span-3 md:row-span-1 col-span-1 md:col-span-3 px-8 md:px-14 py-10 md:py-16 bg-white">
          <div className="flex flex-col gap-2  mb-8">
            <h2 className="font-bold text-3xl">
              {form == "login" ? "Welcome back!" : "Create an account"}
            </h2>
            <h4 className="text-stone-600">
              {form == "login" ? "Sign in to your account" : "Start organizing your links today"}
              
            </h4>
          </div>
          {form == "login" ? 
            <>
              <form onSubmit={handleLogin} id="signInForm" className="flex flex-col gap-1 mb-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && (
                  <p className="text-sm text-red-500 text-center -mt-1">{error}</p>
                )}
              </form>

              <Button type="submit" form="signInForm" loading={loading} className="w-full mt-2 justify-center" size="lg">
                Sign in
              </Button>
              <p className="text-sm text-stone-600 flex gap-4 p-4 justify-center items-center text-nowrap">
                <div className="divisor" />
                Don't have an account?
                <div className="divisor" />
              </p>
              <Button variant="secondary" className="justify-center" onClick={onSwitchToSignup} size="lg">Create account</Button>
            </>
            :
            <>
              <form onSubmit={handleSignup} id="signUpForm" className="flex flex-col gap-1 mb-4">
                <Input
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  error={emailError}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  helperText={passwordHelperText}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && (
                  <p className="text-sm text-red-500 text-center -mt-1">{error}</p>
                )}
              </form>
              
              <Button size="lg" type="submit" form="signUpForm" loading={loading} className="w-full mt-2 justify-center">
                Sign up
              </Button>
        
              <p className="text-sm text-stone-600 flex gap-4 p-4 justify-center items-center text-nowrap">
                <div className="divisor" />
                Already have an account?
                <div className="divisor" />
              </p>
              <Button size="lg" variant="secondary" className="justify-center" onClick={onSwitchToLogin}>Log in</Button>
            </>
          }
        </div>
      </div>
    </main>
  );
}
