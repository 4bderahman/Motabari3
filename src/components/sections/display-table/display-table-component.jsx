import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RxCrossCircled } from "react-icons/rx";
import { HiPencil } from "react-icons/hi";

const DisplayTableComponent = ({
  tableHeader,
  filterData,
  filter,
  handleCheckboxChange,
  type,
  handleUpdateClick,
  handleDelete,
  setStatus,
  selectedId,
  setSelectedId,
  updatedData,
  setUpdatedData,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (selectedId && showEditModal) {
      const item = filterData(filter).find((item) => item.id === selectedId);
      setEditingItem(item);
    }
  }, [selectedId, showEditModal, filter, filterData]);

  const handleEdit = (item) => {
    setSelectedId(item.id);
    switch (type) {
      case "donate-blood":
        setUpdatedData({
          name: item.name,
          email: item.email,
          phone: item.phone,
          bloodType: item.bloodType,
          date: item.date,
          units: item.units,
          status: item.status,
          message: item.message,
        });
        break;
      case "host-blood-drive":
        setUpdatedData({
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          institute: item.institute || "",
          designation: item.designation || "",
          city: item.city || "",
          message: item.message || "",
        });
        break;
      case "need-help":
        setUpdatedData({
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          message: item.message || "",
        });
        break;
      default:
        setUpdatedData({
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          source: item.source || "",
        });
    }
    setShowEditModal(true);
    setStatus("editing");
  };

  const handleSave = () => {
    handleUpdateClick(selectedId);
    setShowEditModal(false);
    setEditingItem(null);
    setStatus("success");
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setSelectedId(null);
    setStatus("normal");
  };

  console.log("Display table data:", filterData(filter));

  const renderDynamicCells = (item) => {
    const getSourceStyles = (source) => {
      switch (source) {
        case "donate-blood":
          return "bg-blood-100 text-blood-800";
        case "need-blood":
          return "bg-emerald-100 text-emerald-800";
        case "host-blood-drive":
          return "bg-amber-100 text-amber-800";
        case "need-help":
          return "bg-indigo-100 text-indigo-800";
        case "signup":
          return "bg-violet-100 text-violet-800";
        case "hospital":
          return "bg-blue-100 text-blue-800";
        case "donor":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    switch (type) {
      case "blood-request":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.bloodType}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.units} units</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.urgency === "urgent"
                    ? "bg-blood-700 text-white"
                    : "bg-blood-100 text-blood-800"
                }`}
              >
                {item.urgency}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.status}
                onChange={(e) => handleCheckboxChange(item.id, e.target.value, item.collection)}
                className={`px-3 py-1 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-blood appearance-none cursor-pointer ${
                  item.status === "approved" || item.status === "fulfilled"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.status === "rejected" || item.status === "cancelled"
                    ? "bg-blood-100 text-blood-800"
                    : "bg-amber-100 text-amber-800"
                }`}
                style={{ WebkitAppearance: "none" }}
              >
                <option value="pending" className="bg-white text-gray-900">
                  Pending
                </option>
                <option value="approved" className="bg-white text-gray-900">
                  Approve
                </option>
                <option value="rejected" className="bg-white text-gray-900">
                  Reject
                </option>
                {/* Support fulfilled status for needbloods collection */}
                {item.collection === "needbloods" && (
                  <option value="fulfilled" className="bg-white text-gray-900">
                    Fulfilled
                  </option>
                )}
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceStyles(
                  item.source
                )}`}
              >
                {item.source || "unknown"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {new Date(item.date).toLocaleDateString()}
            </td>
          </>
        );

      case "new-users":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.date
                ? new Date(item.date).toLocaleDateString()
                : new Date(item.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceStyles(
                  item.source
                )}`}
              >
                {item.source}
              </span>
            </td>
          </>
        );

      case "donate-blood":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.bloodType}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.message}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.donated ? "yes" : "no"}
                onChange={(e) =>
                  handleCheckboxChange(item.id, e.target.value === "yes")
                }
                className={`px-3 py-1 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-blood appearance-none cursor-pointer ${
                  item.donated
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
                style={{ WebkitAppearance: "none" }}
              >
                <option value="no" className="bg-white text-gray-900">
                  Not Yet
                </option>
                <option value="yes" className="bg-white text-gray-900">
                  Donated
                </option>
              </select>
            </td>
          </>
        );

      case "host-blood-drive":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.institute}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.designation}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.city}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="max-w-xs truncate" title={item.message}>
                {item.message || "-"}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{item.date || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.done ? "yes" : "no"}
                onChange={(e) =>
                  handleCheckboxChange(item.id, e.target.value === "yes")
                }
                className={`px-3 py-1 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-blood appearance-none cursor-pointer ${
                  item.done
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
                style={{ WebkitAppearance: "none" }}
              >
                <option value="no" className="bg-white text-gray-900">
                  Not Done
                </option>
                <option value="yes" className="bg-white text-gray-900">
                  Done
                </option>
              </select>
            </td>
          </>
        );

      case "need-help":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.reason || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="max-w-xs truncate" title={item.message}>
                {item.message || "-"}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{item.date || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.done ? "yes" : "no"}
                onChange={(e) =>
                  handleCheckboxChange(item.id, e.target.value === "yes")
                }
                className={`px-3 py-1 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-blood appearance-none cursor-pointer ${
                  item.done
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
                style={{ WebkitAppearance: "none" }}
              >
                <option value="no" className="bg-white text-gray-900">
                  Not Done
                </option>
                <option value="yes" className="bg-white text-gray-900">
                  Done
                </option>
              </select>
            </td>
          </>
        );

      default:
        return (
          <td className="px-6 py-4 whitespace-nowrap">
            {/* ... existing checkbox rendering for other types ... */}
          </td>
        );
    }
  };

  const renderActions = (item) => (
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <button
          title="Edit"
          className="p-2 hover:bg-gray-100 rounded-rmd transition-colors"
          onClick={() => handleEdit(item)}
        >
          <HiPencil className="w-4 h-4 text-dark" />
        </button>
        <button
          title="Delete"
          className="p-2 hover:bg-blood-600 hover:text-white rounded-rmd transition-colors"
          onClick={() => handleDelete(item.id, item.collection)} 
        >
          <RxCrossCircled className="w-4 h-4" />
        </button>
      </div>
    </td>
  );

  const renderEditModal = () => {
    if (!showEditModal || !editingItem) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Edit Details
            </h3>
            <div className="mt-2 space-y-4">
              {Object.keys(updatedData).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === "message" ? (
                    <textarea
                      value={updatedData[field]}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          [field]: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-dark_red focus:ring-1 focus:ring-dark_red sm:text-sm p-2"
                      rows="3"
                    />
                  ) : (
                    <input
                      type={field === "email" ? "email" : "text"}
                      value={updatedData[field]}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          [field]: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-dark_red focus:ring-1 focus:ring-dark_red sm:text-sm p-2"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-dark_red hover:bg-red-700 border border-transparent rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50">
            <tr>
              {tableHeader.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filterData(filter).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {renderDynamicCells(item)}
                {renderActions(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderEditModal()}
    </>
  );
};

DisplayTableComponent.propTypes = {
  tableHeader: PropTypes.arrayOf(PropTypes.string).isRequired,
  filterData: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  handleUpdateClick: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  setSelectedId: PropTypes.func.isRequired,
  updatedData: PropTypes.object.isRequired,
  setUpdatedData: PropTypes.func.isRequired,
};

export default DisplayTableComponent;
