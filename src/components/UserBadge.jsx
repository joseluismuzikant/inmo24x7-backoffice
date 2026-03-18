export const UserBadge = ({ user, profile }) => {
  if (!profile) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
        {profile.email?.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col text-xs">
        <span className="font-semibold text-gray-800">{profile.email}</span>
        <span className="text-gray-500">{profile.role}</span>
      </div>
    </div>
  );
};
