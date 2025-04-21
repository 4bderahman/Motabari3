import React from "react"

function ProfileCard({ donorData }) {
  if (!donorData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Loading donor data...</p>
      </div>
    )
  }

  const formatLastDonation = (dateString) => {
    if (!dateString) return "No donation recorded"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-dark_red mb-4">Profile Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Name</p>
          <p className="font-medium">{donorData.name || "Not provided"}</p>
        </div>
        <div>
          <p className="text-gray-600">Blood Type</p>
          <p className="font-medium">{donorData.bloodType || "Not specified"}</p>
        </div>
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-medium">{donorData.phone || "Not provided"}</p>
        </div>
        <div>
          <p className="text-gray-600">Last Donation</p>
          <p className="font-medium">{formatLastDonation(donorData.lastDonation)}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard

