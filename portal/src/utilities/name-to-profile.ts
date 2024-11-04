const nameProfile = (title: string) => {
  if (title) {
    if (title?.split(" ")?.length === 1) {
      const first = title?.split("")[0];
      return first[0].toUpperCase();
    }

    if (title?.split(" ")?.length > 1) {
      const first = title?.split(" ")[0];
      const second = title?.split(" ")[1];
      const profile = first[0] + second[0];
      return profile.toUpperCase();
    }
  }
};

export default nameProfile;
