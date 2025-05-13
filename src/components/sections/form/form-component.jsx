import PropTypes from "prop-types";
import "./form-component-styles.scss";
import WrapperSection from "../wrapper-section/wrapper-section-component";

const FormComponent = ({
  fields,
  heading,
  buttonText,
  formData,
  setFormData,
  handleSubmit,
  status,
}) => {
  const commonStyles = `block w-full flex justify-start items-start rounded-rsm border-0 px-8 py-3 md:px-10 md:py-4 text-white ring-none placeholder:text-white outline-none focus:ring-1 focus:ring-center focus:ring-light sm:text-sm sm:leading-6`;
  const enabledStyles = `bg-light focus:bg-dark`;
  const selectStyles = `${commonStyles} ${enabledStyles} appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-no-repeat bg-right-4 bg-12`;

  // Debug log to see what formData is being received
  console.log("FormComponent received formData:", formData);

  return (
    <WrapperSection>
      <div className="form-wrapper -mt-[10em] w-full relative p-6 py-10 lg:p-20 lg:pb-10 rounded-rmd z-[25] overflow-hidden">
        <h3 className="not-italic text-center font-medium text-[16px] sm:text-[25px] leading-[34px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white">
          {heading}
        </h3>
        {status === "Submited" ? (
          <p className="mt-5 text-sm text-center text-white sm:text-base">
            Thank you for contacting Motabari3. We will get back to you as soon
            as possible.
          </p>
        ) : (
          <form
            className="contact-form grid grid-cols-1 sm:grid-cols-2 gap-5 w-full relative sm:p-6 py-8 sm:p-10 rounded-rmd z-[25] overflow-hidden"
            onSubmit={handleSubmit}
          >
            {fields.map((field) => {
              // Get the value for this field
              const fieldValue = formData[field.name] || "";

              // Inline styles for disabled inputs
              const disabledStyle = field.disabled
                ? {
                    backgroundColor: "rgba(100, 100, 100, 0.8)",
                    color: "white",
                    opacity: 0.9,
                    cursor: "not-allowed",
                  }
                : {};

              return (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "sm:col-span-2" : ""}
                >
                  {field.type === "textarea" ? (
                    <textarea
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                      value={fieldValue}
                      name={field.name}
                      id={field.name}
                      className={`${commonStyles} ${
                        !field.disabled ? enabledStyles : ""
                      } min-h-[100px] resize-y`}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={field.disabled}
                      style={disabledStyle}
                    />
                  ) : field.type === "select" ? (
                    <div className="relative">
                      <select
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        value={fieldValue}
                        name={field.name}
                        id={field.name}
                        className={`${selectStyles} ${
                          field.name === "urgency" && fieldValue === "critical"
                            ? "bg-red-700 border-red-500" 
                            : field.name === "urgency" && fieldValue === "urgent"
                            ? "bg-amber-700 border-amber-500"
                            : ""
                        }`}
                        required={field.required}
                        disabled={field.disabled}
                        style={disabledStyle}
                      >
                        {field.options?.map((option) => {
                          // Add color indicators for urgency levels
                          let optionClass = "bg-dark text-white";
                          if (field.name === "urgency") {
                            if (option.value === "normal") {
                              optionClass = "bg-dark text-white";
                            } else if (option.value === "urgent") {
                              optionClass = "bg-amber-700 text-white font-medium";
                            } else if (option.value === "critical") {
                              optionClass = "bg-red-700 text-white font-medium";
                            }
                          }
                          
                          return (
                            <option 
                              key={option.value} 
                              value={option.value}
                              className={optionClass}
                            >
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                      {field.name === "urgency" && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center">
                          {fieldValue === "urgent" && (
                            <div className="h-3 w-3 rounded-full bg-amber-500 mr-1 animate-pulse"></div>
                          )}
                          {fieldValue === "critical" && (
                            <div className="h-3 w-3 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        value={fieldValue}
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        className={`${commonStyles} ${
                          !field.disabled ? enabledStyles : ""
                        }`}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={field.disabled}
                        style={disabledStyle}
                        min={field.min}
                        max={field.max}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-white text-dark hover:bg-dark hover:text-white transition-all duration-300 ease-in-out py-3 md:py-4 rounded-rsm font-medium text-sm sm:text-base"
              >
                {buttonText}
              </button>
            </div>
          </form>
        )}
      </div>
    </WrapperSection>
  );
};

FormComponent.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      min: PropTypes.number,
      max: PropTypes.number,
    })
  ).isRequired,
  heading: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

export default FormComponent;
