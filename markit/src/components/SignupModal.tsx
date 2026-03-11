import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import { usersService } from "../services/users";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

  return (
    <Modal title="Create an account" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          onChange={(e) => setEmail(e.target.value)}
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
        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign up
        </Button>
      </form>

      <p className="text-sm text-center text-stone-600 mt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-teal-500 font-medium hover:underline cursor-pointer"
        >
          Log in
        </button>
      </p>
    </Modal>
  );
}
