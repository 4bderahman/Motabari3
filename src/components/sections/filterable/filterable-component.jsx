import PropTypes from "prop-types";

const FilterableComponent = ({
  filter,
  handleSearchChange,
  optionsData,
  selectedOpt,
  handleInputChange,
}) => {
  return (
    <div className="flex justify-start flex-row gap-4 mb-4">
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={handleSearchChange}
          className="border-2 px-4 py-2 rounded-lg placeholder:text-gray-500 shadow-sm border-gray-200 outline-none bg-white focus:border-dark_red focus:ring-1 focus:ring-dark_red"
        />
      </div>
      <div className="flex flex-row items-center gap-4">
        {optionsData.map((item) => (
          <label
            className="inline-flex items-center cursor-pointer"
            key={item.id}
          >
            <input
              type="radio"
              name="filterOption"
              value={item.value}
              checked={selectedOpt === item.value}
              onChange={handleInputChange}
              className="form-radio text-dark_red focus:ring-dark_red h-4 w-4"
            />
            <span className="ml-2 text-sm text-gray-700">{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

FilterableComponent.propTypes = {
  filter: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  optionsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOpt: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default FilterableComponent;
