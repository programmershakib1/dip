const ProfileHeader = ({ userData, currentUser }) => {
  return (
    <div className="mx-5 md:mx-0 relative mb-20 md:mb-20 lg:mb-10">
      <img
        className="w-full h-48 md:h-80 lg:h-[450px] object-cover border-2 rounded-xl"
        src={userData?.cover}
        alt="banner"
      />
      <div className="absolute -bottom-32 md:left-5 flex flex-col md:flex-row items-center md:gap-5">
        <img
          className="w-32 h-32 md:w-40 md:h-40 object-cover border-4 rounded-full"
          src={currentUser?.photoURL || userData?.profile}
          alt="profile"
        />
        <div className="mt-2">
          <h2 className="text-xl font-semibold">
            {currentUser?.displayName || userData?.name}
          </h2>
          <div className="flex items-center gap-3">
            <p>{userData?.friends?.length || 0} friends</p>
            <p>{userData?.followers?.length || 0} followers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
