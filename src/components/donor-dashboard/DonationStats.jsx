const DonationStats = ({ donationCount = 0 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Donation Stats
        </h2>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-dark_red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-dark_red">{donationCount}</p>
            <p className="text-slate-600">Total Donations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationStats;
