import { LogOut, Mail, User as UserIcon, Calendar } from "iconoir-react";
import type { User } from "../types";
import Button from "./Button";
import Modal from "./Modal";
import { getAvatarUrl } from "../lib/avatar";

interface UserInfoModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserInfoModal({ user, onClose, onLogout }: UserInfoModalProps) {
  const displayName = user.name ?? user.email;
  const avatarUrl = getAvatarUrl(user.email);

  return (
    <Modal title="Account" onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-3 -mt-2">
        <div
          aria-hidden="true"
          className="w-20 h-20 rounded-full overflow-hidden bg-teal-100"
        >
          <img src={avatarUrl} alt="" className="w-full h-full" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-lg font-semibold text-stone-900">{displayName}</p>
          {user.name && <p className="text-sm text-stone-500">{user.email}</p>}
        </div>
      </div>

      <dl className="flex flex-col gap-3 w-full bg-stone-100 rounded-2xl p-4">
        {user.name && (
          <InfoRow icon={<UserIcon width={16} height={16} />} label="Name" value={user.name} />
        )}
        <InfoRow icon={<Mail width={16} height={16} />} label="Email" value={user.email} />
        <InfoRow
          icon={<Calendar width={16} height={16} />}
          label="Joined"
          value={formatJoinedDate(user.created_at)}
        />
      </dl>

      <Button
        variant="secondary"
        onClick={onLogout}
        className="w-full justify-center text-red-600!"
      >
        <LogOut width={16} height={16} aria-hidden="true" />
        Log out
      </Button>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-stone-500 shrink-0">
        {icon}
      </span>
      <div className="flex flex-col min-w-0">
        <dt className="text-xs text-stone-500">{label}</dt>
        <dd className="text-sm text-stone-900 truncate">{value}</dd>
      </div>
    </div>
  );
}
