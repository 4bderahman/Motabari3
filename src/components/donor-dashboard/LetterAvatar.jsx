const LetterAvatar = ({ name }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "H";

  return (
    <div className="w-10 h-10 rounded-full bg-dark_red text-white flex items-center justify-center text-base font-medium">
      {firstLetter}
    </div>
  );
};

export default LetterAvatar;
