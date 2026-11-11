import { useState, type FormEvent, type ReactNode } from "react";
import { EditPencil, Lock, LogOut, NavArrowLeft, Trash } from "iconoir-react";
import { toast } from "sonner";
import type { User, UserUpdate } from "../types";
import { usersService } from "../services/users";
import { ApiError } from "../lib/api";
import { getAvatarUrl } from "../lib/avatar";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";

type Tab = "account" | "about";
type AccountView = "overview" | "edit" | "password" | "delete";

interface AccountModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onUserUpdated: (user: User) => void;
  onDeleted: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountModal({
  user,
  onClose,
  onLogout,
  onUserUpdated,
  onDeleted,
}: AccountModalProps) {
  const [tab, setTab] = useState<Tab>("account");
  const [view, setView] = useState<AccountView>("overview");

  function selectTab(next: Tab) {
    setTab(next);
    setView("overview");
  }

  return (
    <Modal onClose={onClose} size="md" flush title="Account">
      <div className="flex flex-col sm:flex-row min-h-[420px]">
        <div
          role="tablist"
          aria-label="Account sections"
          className="flex sm:flex-col gap-1 p-3 sm:p-4 sm:w-52 shrink-0 text-sm"
        >
          <TabButton
            id="account"
            active={tab === "account"}
            onClick={() => selectTab("account")}
          >
            Account
          </TabButton>
          <TabButton
            id="about"
            active={tab === "about"}
            onClick={() => selectTab("about")}
          >
            About Markit
          </TabButton>
        </div>

        <div className="flex-1 min-w-0 bg-white p-6 sm:p-8 pt-14 sm:pt-16">
          {tab === "account" ? (
            <div role="tabpanel" id="account-panel" aria-labelledby="account-tab">
              {view === "overview" && (
                <Overview
                  user={user}
                  onEdit={() => setView("edit")}
                  onPassword={() => setView("password")}
                  onDelete={() => setView("delete")}
                  onLogout={onLogout}
                />
              )}
              {view === "edit" && (
                <EditForm
                  user={user}
                  onCancel={() => setView("overview")}
                  onSaved={(updated) => {
                    onUserUpdated(updated);
                    setView("overview");
                  }}
                />
              )}
              {view === "password" && (
                <PasswordForm onCancel={() => setView("overview")} onSaved={() => setView("overview")} />
              )}
              {view === "delete" && (
                <DeleteForm
                  onCancel={() => setView("overview")}
                  onDeleted={() => {
                    toast.success("Your account was deleted");
                    onDeleted();
                  }}
                />
              )}
            </div>
          ) : (
            <div role="tabpanel" id="about-panel" aria-labelledby="about-tab">
              <About />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab`}
      aria-selected={active}
      aria-controls={`${id}-panel`}
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl text-left whitespace-nowrap transition-colors ${
        active
          ? "bg-stone-200 font-semibold text-stone-900"
          : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

function Overview({
  user,
  onEdit,
  onPassword,
  onDelete,
  onLogout,
}: {
  user: User;
  onEdit: () => void;
  onPassword: () => void;
  onDelete: () => void;
  onLogout: () => void;
}) {
  const firstName = user.name?.split(" ")[0];
  const avatarUrl = getAvatarUrl(user.email);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <div
          aria-hidden="true"
          className="w-20 h-20 rounded-full overflow-hidden bg-teal-100 border border-stone-200"
        >
          <img src={avatarUrl} alt="" className="w-full h-full" />
        </div>
        {user.name && (
          <p className="text-xl font-semibold text-stone-900 font-brand">{user.name}</p>
        )}
        <p className="px-4 py-1.5 rounded-full bg-stone-100 text-sm text-stone-600 break-all text-center">
          {user.email}
        </p>
      </div>

      <p className="text-center text-sm text-stone-500 max-w-xs">
        Bookmarking it since {formatJoinedDate(user.created_at)}.
        {firstName ? ` Thank you, ${firstName}!` : ""}
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Button variant="secondary" className="w-full justify-center" onClick={onEdit}>
          <EditPencil width={16} height={16} aria-hidden="true" />
          Edit account information
        </Button>
        <Button variant="secondary" className="w-full justify-center" onClick={onPassword}>
          <Lock width={16} height={16} aria-hidden="true" />
          Change password
        </Button>
        <Button variant="secondary" className="w-full justify-center" onClick={onDelete}>
          <Trash width={16} height={16} aria-hidden="true" />
          Delete account
        </Button>
        <Button variant="secondary" className="w-full justify-center" onClick={onLogout}>
          <LogOut width={16} height={16} aria-hidden="true" />
          Log out
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 -ml-2">
      <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back">
        <NavArrowLeft width={18} height={18} />
      </Button>
      <h3 className="text-lg font-semibold text-stone-900 font-brand m-0">{title}</h3>
    </div>
  );
}

interface EditErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

function errorsFrom(err: unknown): EditErrors {
  const message = err instanceof Error ? err.message : "Something went wrong";
  if (err instanceof ApiError) {
    if (err.status === 403) return { password: message };
    if (err.status === 400 && /email/i.test(message)) return { email: message };
  }
  return { form: message };
}

function EditForm({
  user,
  onCancel,
  onSaved,
}: {
  user: User;
  onCancel: () => void;
  onSaved: (user: User) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<EditErrors>({});
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const changes: UserUpdate = {};
  if (trimmedName !== (user.name ?? "")) changes.name = trimmedName || null;
  if (normalizedEmail !== user.email) changes.email = normalizedEmail;
  const hasChanges = Object.keys(changes).length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasChanges) return;
    if (changes.email !== undefined && !EMAIL_PATTERN.test(normalizedEmail)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    if (!password) {
      setErrors({ password: "Enter your current password to save changes" });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const updated = await usersService.update({ ...changes, current_password: password });
      toast.success("Account updated");
      onSaved(updated);
    } catch (err) {
      setErrors(errorsFrom(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <SectionHeader title="Edit account information" onBack={onCancel} />

      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          maxLength={100}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined, form: undefined }));
          }}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
          }}
          error={errors.email}
        />
        <Input
          label="Current password"
          type="password"
          value={password}
          autoComplete="current-password"
          helperText="Required to save changes"
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
          }}
          error={errors.password}
        />
        {errors.form && (
          <p role="alert" className="text-sm text-red-600">
            {errors.form}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 justify-center" loading={saving} disabled={!hasChanges}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt ignores anything past 72 bytes, so the server refuses longer ones

function PasswordForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problems: typeof errors = {};
    if (!current) problems.current = "Enter your current password";
    if (next.length < PASSWORD_MIN) {
      problems.next = `Use at least ${PASSWORD_MIN} characters`;
    } else if (new TextEncoder().encode(next).length > PASSWORD_MAX_BYTES) {
      problems.next = `Use at most ${PASSWORD_MAX_BYTES} bytes`;
    } else if (next === current) {
      problems.next = "Choose a password different from the current one";
    }
    if (confirm !== next) problems.confirm = "Passwords don't match";
    if (Object.keys(problems).length > 0) {
      setErrors(problems);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      await usersService.changePassword(current, next);
      toast.success("Password updated. Other sessions were signed out.");
      onSaved();
    } catch (err) {
      const mapped = errorsFrom(err);
      setErrors(mapped.password ? { current: mapped.password } : { form: mapped.form });
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <SectionHeader title="Change password" onBack={onCancel} />

      <div className="flex flex-col gap-4">
        <Input
          label="Current password"
          type="password"
          value={current}
          autoComplete="current-password"
          onChange={(e) => {
            setCurrent(e.target.value);
            setErrors((prev) => ({ ...prev, current: undefined, form: undefined }));
          }}
          error={errors.current}
        />
        <Input
          label="New password"
          type="password"
          value={next}
          autoComplete="new-password"
          helperText={`At least ${PASSWORD_MIN} characters`}
          onChange={(e) => {
            setNext(e.target.value);
            setErrors((prev) => ({ ...prev, next: undefined, form: undefined }));
          }}
          error={errors.next}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          autoComplete="new-password"
          onChange={(e) => {
            setConfirm(e.target.value);
            setErrors((prev) => ({ ...prev, confirm: undefined, form: undefined }));
          }}
          error={errors.confirm}
        />
        {errors.form && (
          <p role="alert" className="text-sm text-red-600">
            {errors.form}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 justify-center" loading={saving}>
          Update password
        </Button>
      </div>
    </form>
  );
}

function DeleteForm({
  onCancel,
  onDeleted,
}: {
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter your current password to delete your account");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await usersService.remove(password);
      onDeleted();
    } catch (err) {
      const mapped = errorsFrom(err);
      setError(mapped.password ?? mapped.form ?? "Could not delete account");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleDelete} noValidate className="flex flex-col gap-6">
      <SectionHeader title="Delete account" onBack={onCancel} />

      <p className="text-sm text-stone-600">
        This permanently deletes your account, along with all of your bookmarks and
        collections. This can't be undone.
      </p>

      <Input
        label="Current password"
        type="password"
        value={password}
        autoComplete="current-password"
        onChange={(e) => {
          setPassword(e.target.value);
          setError("");
        }}
        error={error}
      />

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={deleting}
          className="flex-1 justify-center bg-red-600! hover:bg-red-700! text-white!"
        >
          Delete account
        </Button>
      </div>
    </form>
  );
}

function About() {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-6">
      <img src="/logo.svg" alt="Markit" className="h-10" />

      <p className="text-sm text-stone-600 max-w-sm">
        Markit keeps your bookmarks in one place, organized into collections and easy to search.
      </p>

      <div className="flex flex-col items-center gap-1 mt-16">
        <img src="/madeby.svg" alt="" />
      </div>

      <p className="text-sm text-stone-600">
        Visit{" "}
        <a
          href="https://marcosc.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 underline underline-offset-4 decoration-teal-500 hover:text-teal-700"
        >
          marcosc.dev
        </a>
      </p>
    </div>
  );
}
