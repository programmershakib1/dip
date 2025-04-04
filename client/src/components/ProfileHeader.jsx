const ProfileHeader = ({ userData, currentUser }) => {
  return (
    <div className="relative">
      <img
        className="w-full h-40 md:h-72 lg:h-[450px] object-cover border-2 rounded-xl"
        src={userData?.banner}
        alt="banner"
      />
      <div className="absolute -bottom-20 md:-bottom-28 left-2 md:left-5 flex flex-col md:flex-row items-center md:gap-5">
        <img
          className="w-32 h-32 md:w-40 md:h-40 object-cover border-4 rounded-full"
          src={currentUser?.photoURL || userData?.image}
          alt="profile"
        />
        <div className="md:mt-3">
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
